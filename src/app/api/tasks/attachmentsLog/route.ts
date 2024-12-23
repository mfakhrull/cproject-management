import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import Activity from "@/models/activity";
import { User } from "@/models";
import { getAuth } from "@clerk/nextjs/server";

// POST: Log attachment activity
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = getAuth(req); // Get Clerk user ID from the request

    if (!clerkId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const { taskId, action, fileName } = await req.json();

    // Validate input
    if (!taskId || !action || !fileName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch user details from the database
    const user = await User.findOne({ clerk_id: clerkId }).select("username profilePictureUrl").lean();
    const username = user?.username || "User";
    const avatar = user?.profilePictureUrl || null;

    // Log the attachment activity as an activity
    const newActivity = await Activity.create({
      taskId,
      type: "attachment",
      text: `${username} ${action} file "${fileName}"`,
      timestamp: new Date(),
      user: {
        userId: clerkId,
        name: username,
        avatar,
      },
    });

    return NextResponse.json({ success: true, activity: newActivity });
  } catch (error) {
    console.error("Error logging attachment activity:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
