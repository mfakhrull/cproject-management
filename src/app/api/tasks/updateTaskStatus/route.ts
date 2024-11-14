// src/app/api/tasks/updateTaskStatus/route.ts
import { NextResponse } from "next/server";
import { Task } from "../../../../models";
import dbConnect from "../../../../lib/mongodb";

export async function PATCH(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json(
      { message: "Task ID is required" },
      { status: 400 }
    );
  }

  try {
    const { status } = await req.json();
    const updatedTask = await Task.findByIdAndUpdate(taskId, { status }, { new: true });

    if (updatedTask) {
      return NextResponse.json(updatedTask, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "Task update failed" },
        { status: 404 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error updating task: ${error.message || "Unknown error occurred"}` },
      { status: 500 }
    );
  }
}
