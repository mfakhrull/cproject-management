// src\app\api\bids\opportunities\update\route.ts

import { NextResponse } from "next/server";
import { BidOpportunity } from "@/models/BidOpportunity";
import dbConnect from "@/lib/mongodb";

export async function PUT(req: Request) {
  await dbConnect();

  try {
    const { id, title, description, deadline } = await req.json();

    const updatedOpportunity = await BidOpportunity.findByIdAndUpdate(
      id,
      { title, description, deadline },
      { new: true }
    );

    if (!updatedOpportunity) {
      return NextResponse.json(
        { message: "Bid opportunity not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedOpportunity, { status: 200 });
  } catch (error: any) {
    console.error("Error updating bid opportunity:", error);
    return NextResponse.json(
      { message: `Error updating bid opportunity: ${error.message}` },
      { status: 500 }
    );
  }
}
