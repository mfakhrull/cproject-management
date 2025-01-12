import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import EditorDocument from "@/models/EditorDocument";
import { Project } from "@/models";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  await dbConnect();

  try {
    const document = await EditorDocument.findOne({
      _id: new mongoose.Types.ObjectId(id),
    })
      .populate({ path: "projectId", select: "name _id" }) // Populate project name and ID
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
