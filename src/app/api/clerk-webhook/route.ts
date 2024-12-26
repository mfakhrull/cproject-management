import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import dbConnect from "../../../lib/mongodb";
import { User } from "../../../models";
import SupplierModel from "../../../models/supplier";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  if (evt.type === "user.created") {
    await dbConnect();

    const {
      id: clerkId,
      username,
      image_url,
      email_addresses,
      first_name,
      last_name,
      public_metadata,
    } = evt.data;

    const employeeId = public_metadata?.employeeId || null;
    const role = public_metadata?.role || "employee";
    const rolePermissions = Array.isArray(public_metadata?.rolePermissions)
      ? public_metadata.rolePermissions
      : []; // Ensure rolePermissions is an array of strings

    let finalUsername = username;
    if (!finalUsername) {
      if (email_addresses && email_addresses.length > 0) {
        finalUsername = email_addresses[0].email_address.split("@")[0];
      } else if (first_name && last_name) {
        finalUsername = `${first_name.toLowerCase()}${last_name.toLowerCase()}`;
      } else {
        finalUsername = `user${clerkId.substring(0, 8)}`;
      }
    }

    try {
      const existingUser = await User.findOne({ username: finalUsername });

      if (existingUser) {
        finalUsername = `${finalUsername}${Math.random().toString(36).substring(2, 7)}`;
      }

      const newUser = new User({
        clerk_id: clerkId,
        username: finalUsername.toLowerCase(),
        profilePictureUrl: image_url || "",
        teamId: null,
        employeeId,
        role,
        rolePermissions,
      });

      await newUser.save();
      console.log(`User created successfully with ID: ${newUser._id}`);

      // Check if the role includes "supplier"
      if (role === "supplier" || rolePermissions.includes("supplier")) {
        // Update the Supplier collection with the new clerk_id
        const email = email_addresses?.[0]?.email_address;
        if (email) {
          const updatedSupplier = await SupplierModel.findOneAndUpdate(
            { email },
            { supplierClerkId: clerkId },
            { new: true },
          );

          if (updatedSupplier) {
            console.log(
              `Supplier with email ${email} successfully updated with clerk ID: ${clerkId}`,
            );
          } else {
            console.error(
              `No supplier found with email ${email} to update clerk ID: ${clerkId}`,
            );
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true, userId: newUser._id }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      console.error("Error saving user:", error);
      return new Response(JSON.stringify({ error: "Error saving user data" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
