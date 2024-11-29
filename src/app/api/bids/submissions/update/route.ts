import { NextResponse } from "next/server";
import { BidSubmission } from "@/models/BidSubmission";
import dbConnect from "@/lib/mongodb";
export async function PUT(req: Request) {
    await dbConnect();
  
    try {
      const { id, status, comments } = await req.json();
  
      const updatedSubmission = await BidSubmission.findByIdAndUpdate(
        id,
        { status, comments },
        { new: true }
      );
  
      if (!updatedSubmission) {
        return NextResponse.json(
          { message: "Bid submission not found." },
          { status: 404 }
        );
      }
  
      return NextResponse.json(updatedSubmission, { status: 200 });
    } catch (error: any) {
      console.error("Error updating bid submission:", error);
      return NextResponse.json(
        { message: `Error updating bid submission: ${error.message}` },
        { status: 500 }
      );
    }
  }