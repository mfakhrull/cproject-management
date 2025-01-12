import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import EditorDocument from "@/models/EditorDocument";

export async function GET() {
  await dbConnect();

  try {
    // Fetch documents with `status: "OPEN"` and populate project details
    const documents = await EditorDocument.find({ status: "OPEN" })
      .populate({
        path: "projectId",
        select: "name", // Include only the project name
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(documents, { status: 200 });
  } catch (error) {
    console.error("Error fetching open opportunities:", error);
    return NextResponse.json(
      { message: "Failed to fetch open opportunities" },
      { status: 500 }
    );
  }
}
