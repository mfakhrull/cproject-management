// src\app\api\bids\opportunities\read\route.ts

import { NextResponse } from "next/server";
import { BidOpportunity } from "@/models/BidOpportunity";
import dbConnect from "@/lib/mongodb";

export async function GET() {
  await dbConnect();

  try {
    const opportunities = await BidOpportunity.find().populate("projectId", "name");

    return NextResponse.json(opportunities, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching bid opportunities:", error);
    return NextResponse.json(
      { message: `Error fetching bid opportunities: ${error.message}` },
      { status: 500 }
    );
  }
}

export const revalidate = 0;
