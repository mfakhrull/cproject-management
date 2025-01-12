import { NextResponse } from "next/server";
import Activity from "@/models/activity"; // Import the Activity model
import mongoose from "mongoose";

// Fetch replies for a parent comment
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parentCommentId = url.searchParams.get("parentCommentId");

    if (!parentCommentId || !mongoose.isValidObjectId(parentCommentId)) {
      return NextResponse.json(
        { error: "Invalid or missing Parent Comment ID" },
        { status: 400 }
      );
    }

    const replies = await Activity.find({ parentCommentId })
      .sort({ timestamp: 1 })
      .lean();

    return NextResponse.json(replies);
  } catch (error) {
    console.error("Error fetching replies:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const revalidate = 0;
