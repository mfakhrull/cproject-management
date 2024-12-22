import { NextResponse } from "next/server";
import { NextRequest } from "next/server"; // Import NextRequest
import Activity from "@/models/activity"; // Import the Activity model
import {User} from "@/models"; // Import the User model
import { getAuth } from "@clerk/nextjs/server"; // Import Clerk server-side auth

// POST: Log tracked time
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = getAuth(req); // Get the Clerk user ID from the request

    if (!clerkId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const { taskId, trackedTime, action } = await req.json();

    // Validate input
    if (!taskId || trackedTime === undefined || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch user details from the database
    const user = await User.findOne({ clerk_id: clerkId }).select("username profilePictureUrl").lean();
    const username = user?.username || "User";
    const avatar = user?.profilePictureUrl || null;

    // Log the tracked time as an activity
    const newActivity = await Activity.create({
      taskId,
      type: "timeTracking",
      text: `${username} ${action} time ⏱️ ${trackedTime}s on ${new Date().toLocaleDateString()}`,
      duration: trackedTime,
      timestamp: new Date(),
      user: {
        userId: clerkId,
        name: username,
        avatar,
      },
    });

    return NextResponse.json({ success: true, activity: newActivity });
  } catch (error) {
    console.error("Error logging time tracking:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET: Fetch all time tracking logs for a task
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const taskId = url.searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const logs = await Activity.find({ taskId, type: "timeTracking" }).sort({ timestamp: -1 });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching time tracking logs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
