import { NextResponse } from "next/server";
import { MaterialRequest, Project } from "@/models"; // Adjust path as needed
import dbConnect from "@/lib/mongodb";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const { items, notes, requestedBy } = await req.json();

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "At least one material item is required." },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.name || !item.quantity || !item.priority) {
        return NextResponse.json(
          { message: "Each item must include a name, quantity, and priority." },
          { status: 400 }
        );
      }
    }

    if (!requestedBy) {
      return NextResponse.json(
        { message: "RequestedBy field is required." },
        { status: 400 }
      );
    }

    // Create a new material request
    const newRequest = await MaterialRequest.create({
      projectId: params.id,
      requestedBy,
      status: "PENDING",
      items, // Array of material items
      notes,
    });

    // Update the project with the new material request reference
    await Project.findByIdAndUpdate(
      params.id,
      { $push: { materialRequests: newRequest._id } },
      { new: true }
    );

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error: any) {
    console.error("Error creating material request:", error);
    return NextResponse.json(
      { message: `Error creating material request: ${error.message}` },
      { status: 500 }
    );
  }
}
