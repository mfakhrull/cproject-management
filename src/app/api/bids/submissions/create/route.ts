import { NextResponse } from "next/server";
import { BidSubmission } from "@/models/BidSubmission";
import dbConnect from "@/lib/mongodb";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { bidOpportunityId, contractorId, price, timeline, proposalUrl } =
      await req.json();

    if (!bidOpportunityId || !contractorId || !price || !timeline || !proposalUrl) {
      return NextResponse.json(
        { message: "All fields are required: bidOpportunityId, contractorId, price, timeline, proposalUrl." },
        { status: 400 }
      );
    }

    const newSubmission = await BidSubmission.create({
      bidOpportunityId,
      contractorId,
      price,
      timeline,
      proposalUrl,
    });

    return NextResponse.json(newSubmission, { status: 201 });
  } catch (error: any) {
    console.error("Error creating bid submission:", error);
    return NextResponse.json(
      { message: `Error creating bid submission: ${error.message}` },
      { status: 500 }
    );
  }
}