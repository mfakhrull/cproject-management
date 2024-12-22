import { NextResponse } from "next/server";
import cloudinary from "@/utils/cloudinary";
import { Task } from "@/models";
import dbConnect from "@/lib/mongodb";


// GET: Fetch Attachments
export async function GET(req: Request, { params }: { params: { id: string } }) {
    await dbConnect();
  
    const { id } = params; // Task ID
  
    try {
      const task = await Task.findById(id).select("attachments");
  
      if (!task || !task.attachments) {
        return NextResponse.json({ message: "Task not found or no attachments available" }, { status: 404 });
      }
  
      return NextResponse.json(task.attachments, { status: 200 });
    } catch (error: any) {
      console.error("Error fetching attachments:", error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }

// POST: Upload Attachment
export async function POST(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  const { id } = params; // Task ID
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const uploadedBy = formData.get("uploadedBy") as string | null;

  if (!file || !uploadedBy) {
    return NextResponse.json({ message: "File and uploadedBy are required" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64File = `data:${file.type};base64,${Buffer.from(arrayBuffer).toString("base64")}`;

  try {
    const uploadResult = await cloudinary.uploader.upload(base64File, {
      folder: `tasks/${id}/attachments`,
      resource_type: "auto",
    });

    const newAttachment = {
      fileName: file.name,
      fileUrl: uploadResult.secure_url,
      uploadedBy,
      uploadedAt: new Date(),
    };

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $push: { attachments: newAttachment } },
      { new: true }
    );

    if (!updatedTask || !updatedTask.attachments) {
      return NextResponse.json({ message: "Task not found or failed to update attachments" }, { status: 404 });
    }

    return NextResponse.json(newAttachment, { status: 201 });
  } catch (error: any) {
    console.error("Error uploading attachment:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PUT: Remove Attachment
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    await dbConnect();
  
    const { id } = params; // Task ID
    const { attachmentId } = await req.json();
  
    if (!id || !attachmentId) {
      return NextResponse.json(
        { message: "Task ID and Attachment ID are required." },
        { status: 400 }
      );
    }
  
    try {
      // Find the task by ID
      const task = await Task.findById(id);
  
      if (!task || !task.attachments) {
        return NextResponse.json({ message: "Task not found." }, { status: 404 });
      }
  
      // Find the attachment to delete
      const attachment = task.attachments.find(
        (attachment) => attachment._id.toString() === attachmentId
      );
  
      if (!attachment) {
        return NextResponse.json(
          { message: "Attachment not found in the task." },
          { status: 404 }
        );
      }
  
      // Extract Cloudinary `publicId`
      if (attachment.fileUrl) {
        const urlParts = attachment.fileUrl.split("/");
        const fileNameWithExtension = urlParts[urlParts.length - 1].split("?")[0]; // Handle query strings
        const publicId = fileNameWithExtension.split(".")[0]; // Remove file extension
  
        // Delete the file from Cloudinary
        try {
          await cloudinary.uploader.destroy(`tasks/${id}/attachments/${publicId}`);
        } catch (cloudinaryError) {
          console.error("Error removing attachment from Cloudinary:", cloudinaryError);
        }
      }
  
      // Remove the attachment from the task
      const updatedTask = await Task.findByIdAndUpdate(
        id,
        { $pull: { attachments: { _id: attachmentId } } },
        { new: true }
      );
  
      if (!updatedTask) {
        return NextResponse.json(
          { message: "Failed to update task after deleting the attachment." },
          { status: 500 }
        );
      }
  
      return NextResponse.json({ message: "Attachment deleted successfully." }, { status: 200 });
    } catch (error: any) {
      console.error("Error deleting attachment:", error);
      return NextResponse.json(
        { message: `Error deleting attachment: ${error.message}` },
        { status: 500 }
      );
    }
  }