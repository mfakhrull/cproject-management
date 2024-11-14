// src/app/api/tasks/getUserTasks/route.ts
import { NextResponse } from "next/server";
import { Task } from "../../../../models";
import dbConnect from "../../../../lib/mongodb";

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { message: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    const tasks = await Task.find({
      $or: [{ authorId: userId }, { assignedUserId: userId }],
    });
    return NextResponse.json(tasks, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error retrieving user's tasks: ${error.message || "Unknown error occurred"}` },
      { status: 500 }
    );
  }
}
