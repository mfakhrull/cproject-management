import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ContractorModel from "@/models/contractor";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { name, email, phone, address, specialties } = await req.json();

    if (!name || !email || !phone || !address) {
      return NextResponse.json(
        { message: "Name, email, phone, and address are required." },
        { status: 400 }
      );
    }

    // Create the contractor in the database
    const newContractor = new ContractorModel({
      name,
      email,
      phone,
      address,
      specialties: specialties || [],
      complianceDocs: [], // Empty by default
      projectHistory: [], // Empty by default
      contractorClerkId: null, // Clerk ID to be added later
    });

    await newContractor.save();

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
        public_metadata: { role: "contractor", rolePermissions: ["contractor"] }, // Metadata for the user
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

    // Update the contractor with Clerk ID
    newContractor.contractorClerkId = clerkId;
    await newContractor.save();

    return NextResponse.json(newContractor, { status: 201 });
  } catch (error) {
    console.error("Error adding contractor:", error);
    return NextResponse.json(
      { message: "Failed to add contractor" },
      { status: 500 }
    );
  }
}
