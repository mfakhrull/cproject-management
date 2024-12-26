import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SupplierModel from "@/models/supplier";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { name, email, phone, address, materials } = await req.json();

    if (!name || !email || !phone || !address) {
      return NextResponse.json(
        { message: "Name, email, phone, and address are required." },
        { status: 400 }
      );
    }

    // Create the supplier in the database
    const newSupplier = new SupplierModel({
      name,
      email,
      phone,
      address,
      materials: materials || [],
      complianceDocs: [], // Empty by default
      orderHistory: [], // Empty by default
      supplierClerkId: null, // Clerk ID to be added later
    });

    await newSupplier.save();

    // Clerk Invitation
    const clerkSecretKey = process.env.CLERK_SECRET_KEY; // Ensure you have configured this in your environment variables
    if (!clerkSecretKey) {
      return NextResponse.json(
        { error: "Clerk secret key is not configured" },
        { status: 500 }
      );
    }

    const clerkResponse = await fetch("https://api.clerk.com/v1/invitations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clerkSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        public_metadata: { role: "supplier", rolePermissions: ["supplier"] }, // Metadata for the user
        notify: true, // Send invitation email
      }),
    });

    if (!clerkResponse.ok) {
      console.error("Error sending Clerk invitation:", await clerkResponse.text());
      return NextResponse.json(
        { error: "Failed to send Clerk invitation" },
        { status: 500 }
      );
    }

    const clerkResponseData = await clerkResponse.json();
    const clerkId = clerkResponseData?.id;

    // Update the supplier with Clerk ID
    newSupplier.supplierClerkId = clerkId;
    await newSupplier.save();

    return NextResponse.json(newSupplier, { status: 201 });
  } catch (error) {
    console.error("Error adding supplier:", error);
    return NextResponse.json(
      { message: "Failed to add supplier" },
      { status: 500 }
    );
  }
}
