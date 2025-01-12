import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Bid, { IBid } from "@/models/Bid";
import { User } from "@/models"; // Ensure User model is imported

export async function GET(req: Request, context: { params: { id: string } }) {
  await dbConnect();

  const { id: projectId } = context.params;

  try {
    // Fetch the approved bid for the project
    const approvedBid = await Bid.findOne({ projectId, status: "APPROVED" }).lean<IBid>(); // Explicitly type to IBid

    if (!approvedBid) {
      return NextResponse.json(null, { status: 200 });
    }

    // Fetch contractor details using contractorId
    const contractor = await User.findOne({ clerk_id: approvedBid.contractorId }).lean();

    // Add contractorName to the approved bid data
    const response = {
      ...approvedBid,
      contractorName: contractor?.username || "Unknown Contractor",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching approved bid:", error);
    return NextResponse.json(
      { message: "Failed to fetch approved bid." },
      { status: 500 }
    );
  }
}

export const revalidate = 0;
