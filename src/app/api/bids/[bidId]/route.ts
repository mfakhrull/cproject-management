import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Bid, { IBid } from "@/models/Bid";
import { Project, User } from "@/models";

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
