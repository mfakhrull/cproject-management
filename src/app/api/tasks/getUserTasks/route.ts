// src/app/api/tasks/getUserTasks/route.ts
import { NextResponse } from "next/server";
import { Task } from "../../../../models";
import dbConnect from "../../../../lib/mongodb";

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId"); // `userId` is the `clerk_id`

  if (!userId) {
    return NextResponse.json(
      { message: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    // Query tasks where the user is either the author or the assignee
    const tasks = await Task.find({
      $or: [{ authorId: userId }, { assignedUserId: userId }],
    })
      .populate("projectId", "name") // Populate project details if needed
      .populate("authorId", "username") // Populate author details if needed
      .populate("assignedUserId", "username"); // Populate assignee details if needed

    return NextResponse.json(tasks, { status: 200 });
  } catch (error: any) {
    console.error("Error retrieving user's tasks:", error);
    return NextResponse.json(
      {
        message: `Error retrieving user's tasks: ${
          error.message || "Unknown error occurred"
        }`,
      },
      { status: 500 }
    );
  }
}
