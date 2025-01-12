// src/app/api/users/getAssignees/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Task, User } from "@/models";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { message: "Task ID is required." },
        { status: 400 }
      );
    }

    // Fetch the task and its assignedUserIds
    const task = await Task.findById(taskId).select("assignedUserIds");
    if (!task) {
      return NextResponse.json(
        { message: "Task not found." },
        { status: 404 }
      );
    }

    // Fetch user details for each assigned user
    const assignees = await User.find({
      clerk_id: { $in: task.assignedUserIds },
    }).select("clerk_id username role");

    return NextResponse.json(assignees, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching assignees:", error.message || error);
    return NextResponse.json(
      { message: "Failed to fetch assignees." },
      { status: 500 }
    );
  }
}

export const revalidate = 0;
