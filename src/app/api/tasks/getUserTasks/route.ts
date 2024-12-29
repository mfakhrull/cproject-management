// src/app/api/tasks/getUserTasks/route.ts
import { NextResponse } from "next/server";
import { Task } from "../../../../models";
import { User } from "../../../../models";
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
    // Fetch tasks where the user is either the author or an assignee
    const tasks = await Task.find({
      $or: [{ authorId: userId }, { assignedUserIds: userId }],
    }).populate("projectId", "name"); // Populate project details

    // Collect all unique `assignedUserIds` from tasks
    const allAssigneeIds = Array.from(
      new Set(tasks.flatMap((task) => task.assignedUserIds || []))
    );

    // Fetch user details for all assignees
    const users = await User.find(
      { clerk_id: { $in: allAssigneeIds } },
      { clerk_id: 1, username: 1, role: 1 } // Fetch only relevant fields
    );

    // Map assignee details to each task
    const tasksWithAssignees = tasks.map((task) => {
      const assigneesDetails = (task.assignedUserIds || []).map((userId) =>
        users.find((user) => user.clerk_id === userId)
      );
      return { ...task.toObject(), assigneesDetails };
    });

    return NextResponse.json(tasksWithAssignees, { status: 200 });
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
