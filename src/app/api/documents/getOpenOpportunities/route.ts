import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Project } from "@/models"; // Import Project from models index
import EditorDocument from "@/models/EditorDocument";

export async function GET() {
  await dbConnect();

  try {
    // Fetch documents with `status: "OPEN"` and populate project details
    const documents = await EditorDocument.find({ status: "OPEN" })
      .select("title deadline status createdAt projectId")
      .populate({
        path: "projectId",
        select: "name", // Include only the project name
      })
      .sort({ createdAt: -1 })
      .lean();

    // Disable caching completely with multiple headers
    const response = NextResponse.json(documents, { status: 200 });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error("Error fetching open opportunities:", error);
    return NextResponse.json(
      { message: "Failed to fetch open opportunities" },
      { status: 500 },
    );
  }
}
