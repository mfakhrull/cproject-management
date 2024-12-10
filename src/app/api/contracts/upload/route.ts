import { NextResponse } from "next/server";
import cloudinary from "@/utils/cloudinary";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("contract") as File;

    // Debugging: Ensure the file is received
    console.log("Received contract file:", file);
    console.log("FormData keys:", Array.from(formData.keys()));

    // Validate input
    if (!file) {
      return NextResponse.json(
        { message: "File is required." },
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

    console.log("Uploading to Cloudinary...");

    // Upload file to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(base64File, {
      folder: "contracts",
      resource_type: "auto",
    });

    console.log("Cloudinary upload result:", uploadResult);

    // Return the result in the expected format
    return NextResponse.json({ uploadResult }, { status: 201 });
  } catch (error: any) {
    console.error("Error uploading file:", error);

    return NextResponse.json(
      { message: `Error uploading file: ${error.message}` },
      { status: 500 }
    );
  }
}
