import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Bid from "@/models/Bid";
import cloudinary from "@/utils/cloudinary";
import mongoose from "mongoose";
import { User } from "@/models";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const userId = searchParams.get("userId");
  const permissions = searchParams.get("permissions")?.split(",") || [];

  if (!projectId || !userId) {
    return NextResponse.json(
      { success: false, message: "Project ID and User ID are required" },
      { status: 400 }
    );
  }

  await dbConnect();

  try {
    const canViewAllBids =
      permissions.includes("admin") ||
      permissions.includes("project_manager") ||
      permissions.includes("procurement_team") ||
      permissions.includes("can_see_all_submitted_bid");

    let bids;

    if (canViewAllBids) {
      bids = await Bid.find({ projectId }).sort({ createdAt: -1 }).lean();
    } else {
      bids = await Bid.find({ projectId, contractorId: userId })
        .sort({ createdAt: -1 })
        .lean();
    }

    const contractorIds = bids.map((bid) => bid.contractorId);
    const contractors = await User.find({ clerk_id: { $in: contractorIds } })
      .select("clerk_id username")
      .lean();

    const bidsWithContractors = bids.map((bid) => {
      const contractor = contractors.find(
        (user) => user.clerk_id === bid.contractorId
      );
      return {
        ...bid,
        contractorName: contractor ? contractor.username : "Unknown Contractor",
        documentId: bid.documentId,
      };
    });

    return NextResponse.json({ success: true, bids: bidsWithContractors });
  } catch (error) {
    console.error("Error fetching submitted bids:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch submitted bids" },
      { status: 500 }
    );
  }
}
export const revalidate = 0;


export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse form data
    const formData = await request.formData();
    const projectId = formData.get("projectId")?.toString().trim();
    const documentId = formData.get("documentId")?.toString().trim();
    const contractorId = formData.get("contractorId")?.toString().trim();
    const price = parseFloat(formData.get("price")?.toString() ?? "");
    const timeline = formData.get("timeline")?.toString().trim();
    const startDate = formData.get("startDate")?.toString().trim();
    const endDate = formData.get("endDate")?.toString().trim();
    const files = formData.getAll("file") as File[];

    // Validate input
    if (
      !projectId ||
      !documentId ||
      !contractorId ||
      isNaN(price) ||
      !timeline ||
      !startDate ||
      !endDate
    ) {
      console.error("Validation Error: Missing or invalid fields", {
        projectId,
        documentId,
        contractorId,
        price,
        timeline,
        startDate,
        endDate,
      });
      return NextResponse.json(
        { success: false, message: "Missing or invalid required fields" },
        { status: 400 },
      );
    }

    // Validate dates
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid date format" },
        { status: 400 },
      );
    }

    // Validate project ID and document ID
    const isValidProjectId = mongoose.Types.ObjectId.isValid(projectId);
    const isValidDocumentId = mongoose.Types.ObjectId.isValid(documentId);

    if (!isValidProjectId || !isValidDocumentId) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid projectId (${projectId}) or documentId (${documentId})`,
        },
        { status: 400 },
      );
    }

    const projectObjectId = new mongoose.Types.ObjectId(projectId);
    const documentObjectId = new mongoose.Types.ObjectId(documentId);

    // Upload files to Cloudinary
    const uploadedAttachments = [];
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const base64File = `data:${file.type};base64,${Buffer.from(
        arrayBuffer,
      ).toString("base64")}`;

      const uploadResult = await cloudinary.uploader.upload(base64File, {
        folder: `bid_attachments/projects/${projectId}/bids`,
        resource_type: "auto",
      });

      uploadedAttachments.push({
        fileName: uploadResult.original_filename || file.name,
        fileUrl: uploadResult.secure_url,
        uploadedBy: contractorId,
      });
    }

    // Prepare bid data
    const bidData = {
      projectId: projectObjectId,
      documentId: documentObjectId,
      contractorId,
      price,
      timeline,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      attachments: uploadedAttachments,
      status: "PENDING",
    };

    // Save bid
    const newBid = new Bid(bidData);
    const savedBid = await newBid.save();

    return NextResponse.json(
      { success: true, bidId: savedBid._id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Bid Submission Error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to submit bid",
      },
      { status: 500 },
    );
  }
}
