import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Bid, { IBid } from "@/models/Bid";
import { Project, User } from "@/models";
import EditorDocument from "@/models/EditorDocument";

// Fetch specific bid details
export async function GET(req: NextRequest, { params }: { params: { bidId: string } }) {
  try {
    await dbConnect();

    // Fetch the bid by its ID and cast it to IBid
    const bid = (await Bid.findById(params.bidId).lean()) as IBid | null;

    if (!bid) {
      return NextResponse.json(
        { success: false, message: "Bid not found" },
        { status: 404 }
      );
    }

    // Ensure projectId and contractorId exist in the bid object
    if (!bid.projectId || !bid.contractorId) {
      return NextResponse.json(
        { success: false, message: "Bid data is incomplete" },
        { status: 400 }
      );
    }

    // Fetch project details
    const project = await Project.findById(bid.projectId).select("name").lean();
    const contractor = await User.findOne({ clerk_id: bid.contractorId }).select("username").lean();

    return NextResponse.json({
      success: true,
      bid: {
        ...bid,
        projectName: project?.name || "Unknown Project",
        contractorName: contractor?.username || "Unknown Contractor",
      },
    });
  } catch (error) {
    console.error("Error fetching bid details:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch bid details" },
      { status: 500 }
    );
  }
}

// Update bid status
export async function PATCH(req: NextRequest, { params }: { params: { bidId: string } }) {
  const { status, documentId } = await req.json();

  await dbConnect();

  try {
    // Find the bid by ID
    const bid = await Bid.findById(params.bidId);
    if (!bid) {
      return NextResponse.json({ success: false, message: "Bid not found" }, { status: 404 });
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
          return NextResponse.json({ success: false, message: "Associated document not found or failed to update" }, { status: 404 });
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
          return NextResponse.json({ success: false, message: "Associated document not found or failed to update" }, { status: 404 });
        }

        console.log(`Document reverted to OPEN: ${updatedDocument}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating bid status:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to update bid status" },
      { status: 500 }
    );
  }
}

// Delete bid
export async function DELETE(req: NextRequest, { params }: { params: { bidId: string } }) {
  try {
    await dbConnect();

    const bid = await Bid.findByIdAndDelete(params.bidId);

    if (!bid) {
      return NextResponse.json(
        { success: false, message: "Bid not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bid:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete bid" },
      { status: 500 }
    );
  }
}
