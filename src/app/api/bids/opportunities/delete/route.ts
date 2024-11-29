// src\app\api\bids\opportunities\delete\route.ts

import { NextResponse } from "next/server";
import { BidOpportunity } from "@/models/BidOpportunity";
import dbConnect from "@/lib/mongodb";

export async function DELETE(req: Request) {
  await dbConnect();

  try {
    const { id } = await req.json();

    const deletedOpportunity = await BidOpportunity.findByIdAndDelete(id);

    if (!deletedOpportunity) {
      return NextResponse.json(
        { message: "Bid opportunity not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Bid opportunity deleted successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting bid opportunity:", error);
    return NextResponse.json(
      { message: `Error deleting bid opportunity: ${error.message}` },
      { status: 500 }
    );
  }
}
