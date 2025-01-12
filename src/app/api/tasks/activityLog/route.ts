import { NextResponse } from "next/server";
import Activity from "@/models/activity"; // Import the Activity model
import mongoose from "mongoose";

// Fetch activity log for a task
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const taskId = url.searchParams.get("taskId");

    if (!taskId || !mongoose.isValidObjectId(taskId)) {
      return NextResponse.json({ error: "Invalid or missing Task ID" }, { status: 400 });
    }

    // Fetch top-level comments only (parentCommentId is null) and other activities
    const activities = await Activity.find({
      taskId,
      $or: [{ type: { $ne: "comment" } }, { parentCommentId: null }],
    })
      .sort({ timestamp: -1 })
      .lean();

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const revalidate = 0;


// Log an activity for a task
export async function POST(req: Request) {
  try {
    const { taskId, type, ...data } = await req.json();

    if (!taskId || !type || !mongoose.isValidObjectId(taskId)) {
      return NextResponse.json({ error: "Invalid or missing Task ID and type" }, { status: 400 });
    }

    const newActivity = await Activity.create({
      taskId,
      type,
      ...data,
      timestamp: data.timestamp || new Date(),
    });

    return NextResponse.json({ success: true, activity: newActivity });
  } catch (error) {
    console.error("Error logging activity:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
