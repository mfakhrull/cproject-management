import { NextResponse } from "next/server";
import cloudinary from "@/utils/cloudinary";
import { Project } from "@/models";
import dbConnect from "@/lib/mongodb";

export async function POST(req: Request, context: { params: { id: string } }) {
  await dbConnect();

  const { params } = context; // Destructure params after ensuring it's awaited

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const uploadedBy = formData.get("uploadedBy") as string;

    console.log("Received contract file:", file);
    console.log("FormData keys:", Array.from(formData.keys()));


    // Validate input
    if (!file || !uploadedBy) {
      return NextResponse.json(
        { message: "File and uploadedBy are required." },
        { status: 400 }
      );
    }

    // Validate file size
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "File size exceeds the 10MB limit." },
        { status: 400 }
      );
    }

    // Convert file to Base64
    const arrayBuffer = await file.arrayBuffer();
    const base64File = `data:${file.type};base64,${Buffer.from(arrayBuffer).toString("base64")}`;

    // Upload file to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(base64File, {
      folder: `project_attachments/projects/${params.id}`,
      resource_type: "auto",
    });

    const { secure_url: fileUrl, original_filename: fileName } = uploadResult;

    // Update the project with the new attachment
    const updatedProject = await Project.findByIdAndUpdate(
      params.id,
      {
        $push: {
          attachments: {
            fileName,
            fileUrl,
            uploadedBy,
          },
        },
      },
      { new: true }
    );

    if (!updatedProject) {
      return NextResponse.json(
        { message: "Project not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProject, { status: 201 });
  } catch (error: any) {
    console.error("Error uploading attachment:", error);
    return NextResponse.json(
      { message: `Error uploading attachment: ${error.message}` },
      { status: 500 }
    );
  }
}
