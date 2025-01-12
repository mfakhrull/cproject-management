import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { Project } from "@/models"; // Import Project from models index
import { EditorDocument } from "@/models/EditorDocument";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  await dbConnect();

  try {
    // Ensure Project model is registered first
    await mongoose.model('Project');

    const document = await EditorDocument.findOne({
      _id: new mongoose.Types.ObjectId(id),
    })
      .populate({ 
        path: "projectId", 
        select: "name _id",
        model: Project  // Use the imported model directly
      })
      .lean();

    if (!document) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(document, { status: 200 });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { message: "Failed to fetch document" },
      { status: 500 },
    );
  }
}