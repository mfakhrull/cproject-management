import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import EditorDocument from "@/models/EditorDocument";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();

    const { userId, content, title, projectId, deadline, status } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const newDocument = new EditorDocument({
      content: JSON.parse(content), // Parse JSON content
      userId,
      title: title || "Untitled Document",
      projectId,
      deadline: deadline || null,
      status: status || "OPEN", // Default to "OPEN" status
    });

    await newDocument.save();

    return NextResponse.json({ success: true, documentId: newDocument._id });
  } catch (error) {
    console.error("Error saving document:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save document" },
      { status: 500 }
    );
  }
}
