import { NextResponse } from "next/server";
import { BidSubmission } from "@/models/BidSubmission";
import dbConnect from "@/lib/mongodb";

export async function GET(req: Request) {
    await dbConnect();
  
    try {
      const submissions = await BidSubmission.find()
        .populate("bidOpportunityId", "title")
        .exec();
  
      return NextResponse.json(submissions, { status: 200 });
    } catch (error: any) {
      console.error("Error fetching bid submissions:", error);
      return NextResponse.json(
        { message: `Error fetching bid submissions: ${error.message}` },
        { status: 500 }
      );
    }
  }