// src/app/api/bids/opportunities/create/route.ts

import { NextResponse } from "next/server";
import { BidOpportunity } from "@/models/BidOpportunity";
import dbConnect from "@/lib/mongodb";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { projectId, title, description, deadline, createdBy } = await req.json();

    if (!projectId || !title || !deadline || !createdBy) {
      return NextResponse.json(
        { message: "Project ID, title, deadline, and createdBy are required." },
        { status: 400 }
      );
    }

    // Validate description format if needed
    if (description && typeof description !== "object") {
      return NextResponse.json(
        { message: "Description must be a valid JSON object." },
        { status: 400 }
      );
    }

    const newOpportunity = await BidOpportunity.create({
      projectId,
      title,
      description, // Save JSON description
      deadline,
      createdBy,
    });

    return NextResponse.json(newOpportunity, { status: 201 });
  } catch (error: any) {
    console.error("Error creating bid opportunity:", error);
    return NextResponse.json(
      { message: `Error creating bid opportunity: ${error.message}` },
      { status: 500 }
    );
  }
}
