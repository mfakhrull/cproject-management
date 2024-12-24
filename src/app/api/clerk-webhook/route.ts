import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import dbConnect from "../../../lib/mongodb";
import { User } from "../../../models";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local");
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
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

  // Handle user creation
  if (evt.type === "user.created") {
    await dbConnect();

    const {
      id,
      username,
      image_url,
      email_addresses,
      first_name,
      last_name,
      public_metadata,
    } = evt.data;

    // Extract employeeId, role, and rolePermissions from the public_metadata
    const employeeId = public_metadata?.employeeId || null;
    const role = public_metadata?.role || "employee"; // Default role is "employee"
    const rolePermissions = public_metadata?.rolePermissions || []; // Default to empty array

    // Generate a username if none exists
    let finalUsername = username;
    if (!finalUsername) {
      // Try to create username from email or name
      if (email_addresses && email_addresses.length > 0) {
        finalUsername = email_addresses[0].email_address.split("@")[0];
      } else if (first_name && last_name) {
        finalUsername = `${first_name.toLowerCase()}${last_name.toLowerCase()}`;
      } else {
        finalUsername = `user${id.substring(0, 8)}`;
      }
    }

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ username: finalUsername });

      if (existingUser) {
        // Append random string if username is taken
        finalUsername = `${finalUsername}${Math.random().toString(36).substring(2, 7)}`;
      }

      // Create new user document with fields matching your User model
      const newUser = new User({
        clerk_id: id,
        username: finalUsername.toLowerCase(),
        profilePictureUrl: image_url || "",
        teamId: null, // Set teamId to null initially if the user has no team upon creation
        employeeId, // Store the employeeId from public_metadata if available
        role, // Store the role from public_metadata if available
        rolePermissions, // Store role permissions from public_metadata if available
      });

      await newUser.save();
      console.log(`User created successfully with ID: ${newUser._id}`);

      return new Response(JSON.stringify({ success: true, userId: newUser._id }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
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
