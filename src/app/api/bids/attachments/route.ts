import { NextResponse } from "next/server";
import cloudinary from "@/utils/cloudinary";
import Bid from "@/models/Bid";
import dbConnect from "@/lib/mongodb";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bidId = formData.get("bidId") as string;
    const uploadedBy = formData.get("uploadedBy") as string;

    // Validate input
    if (!file || !bidId || !uploadedBy) {
      return NextResponse.json(
        { message: "File, bid ID, and uploadedBy are required." },
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
      folder: `bid_attachments/bids/${bidId}`,
      resource_type: "auto",
    });

    const { secure_url: fileUrl, original_filename: fileName } = uploadResult;

    // Update the bid with the new attachment
    const updatedBid = await Bid.findByIdAndUpdate(
      bidId,
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

    if (!updatedBid) {
      return NextResponse.json(
        { message: "Bid not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBid, { status: 201 });
  } catch (error: any) {
    console.error("Error uploading bid attachment:", error);
    return NextResponse.json(
      { message: `Error uploading attachment: ${error.message}` },
      { status: 500 }
    );
  }
}
