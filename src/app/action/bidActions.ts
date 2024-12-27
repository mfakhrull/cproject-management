// src\app\action\bidActions.ts
'use server';

import dbConnect from '@/lib/mongodb';
import Bid from '@/models/Bid';
import mongoose from 'mongoose';
import EditorDocument from "@/models/EditorDocument";
import {User} from "@/models"; // Import the User model
import cloudinary from '@/utils/cloudinary'; // Assuming Cloudinary is configured in this utility

// Fetch all submitted bids for a project according to permissions
export async function getSubmittedBids(
  projectId: string,
  userId: string,
  permissions: string[] = [],
) {
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await dbConnect();

  try {
    let bids;

    // Check if the user has permissions to view all submitted bids
    const canViewAllBids =
      permissions.includes("admin") ||
      permissions.includes("project_manager") ||
      permissions.includes("procurement_team") ||
      permissions.includes("can_see_all_submitted_bid");

    if (canViewAllBids) {
      // User has permissions, fetch all bids for the project
      bids = await Bid.find({ projectId }).sort({ createdAt: -1 }).lean();
    } else {
      // User does not have permissions, only fetch their own bids
      bids = await Bid.find({ projectId, contractorId: userId })
        .sort({ createdAt: -1 })
        .lean();
    }

    // Fetch user details for all contractors
    const contractorIds = bids.map((bid) => bid.contractorId);
    const contractors = await User.find({ clerk_id: { $in: contractorIds } })
      .select("clerk_id username")
      .lean();

    // Map contractor details to bids
    const bidsWithContractors = bids.map((bid) => {
      const contractor = contractors.find(
        (user) => user.clerk_id === bid.contractorId
      );
      return {
        ...bid,
        contractorName: contractor ? contractor.username : "Unknown Contractor",
        documentId: bid.documentId, // Add documentId here
      };
    });

    return bidsWithContractors;
  } catch (error) {
    console.error("Error fetching submitted bids:", error);
    throw new Error("Failed to fetch submitted bids");
  }
}


// Fetch specific bid details
export async function getBidDetails(bidId: string, userId: string) {
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await dbConnect();

  try {
    const bid = await Bid.findOne({
      _id: new mongoose.Types.ObjectId(bidId),
    }).lean();

    if (!bid) {
      throw new Error("Bid not found");
    }

    return bid;
  } catch (error) {
    console.error("Error fetching bid details:", error);
    throw new Error("Failed to fetch bid details");
  }
}

export async function updateBidStatus(
  bidId: string,
  status: "APPROVED" | "REJECTED" | "PENDING",
  documentId?: string
) {
  await dbConnect();

  try {
    // Find the bid by ID
    const bid = await Bid.findById(bidId);
    if (!bid) {
      throw new Error("Bid not found");
    }

    // Update bid status
    bid.status = status;
    await bid.save();

    if (documentId) {
      // Update the associated document based on status
      if (status === "APPROVED") {
        const updatedDocument = await EditorDocument.findByIdAndUpdate(
          documentId,
          {
            $set: {
              status: "CLOSED",
              assignedContractorId: bid.contractorId,
            },
          },
          { new: true }
        );

        if (!updatedDocument) {
          throw new Error("Associated document not found or failed to update");
        }

        console.log(`Document updated to CLOSED: ${updatedDocument}`);
      } else if (status === "PENDING") {
        const updatedDocument = await EditorDocument.findByIdAndUpdate(
          documentId,
          {
            $set: {
              status: "OPEN",
              assignedContractorId: null,
            },
          },
          { new: true }
        );

        if (!updatedDocument) {
          throw new Error("Associated document not found or failed to update");
        }

        console.log(`Document reverted to OPEN: ${updatedDocument}`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating bid status:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update bid status",
    };
  }
}








// Below code can be delete later
// Save a new bid submission with Cloudinary file upload
export async function saveBidSubmission(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const contractorId = formData.get("contractorId") as string;
  const price = parseFloat(formData.get("price") as string);
  const timeline = formData.get("timeline") as string;
  const files = formData.getAll("file") as File[]; // Multiple files

  // Validate required fields
  if (!projectId || !contractorId || !price || !timeline) {
    throw new Error("Missing required fields");
  }

  await dbConnect();

  try {
    console.log("Received projectId:", projectId);

    // Ensure projectId is cast to ObjectId
    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    const uploadedAttachments = [];

    // Process each file for Cloudinary upload
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const base64File = `data:${file.type};base64,${Buffer.from(arrayBuffer).toString(
        "base64"
      )}`;

      const uploadResult = await cloudinary.uploader.upload(base64File, {
        folder: `bid_attachments/projects/${projectId}/bids`,
        resource_type: "auto",
      });

      uploadedAttachments.push({
        fileName: uploadResult.original_filename,
        fileUrl: uploadResult.secure_url,
        uploadedBy: contractorId, // Optional: Keep for traceability
      });
    }

    // Save bid data
    const bidData = {
      projectId: projectObjectId,
      contractorId,
      price,
      timeline,
      attachments: uploadedAttachments,
      status: "PENDING", // Default status
    };

    const newBid = new Bid(bidData);
    await newBid.save();

    return { success: true, bidId: newBid._id };
  } catch (error) {
    console.error("Error saving bid submission:", error);
    throw new Error("Failed to save bid submission");
  }
}
