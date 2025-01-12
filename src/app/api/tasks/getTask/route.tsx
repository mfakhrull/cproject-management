// src/app/api/tasks/getTask/route.ts

import { NextResponse } from "next/server";
import { Task } from "../../../../models";
import dbConnect from "../../../../lib/mongodb";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { message: "Task ID is required" },
        { status: 400 }
      );
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return NextResponse.json(
        { message: `Task with ID ${taskId} not found` },
        { status: 404 }
      );
    }

    console.log(`Task fetched:`, task);

    return NextResponse.json(task, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching task:", error.message || error);
    return NextResponse.json(
      { message: `Error retrieving task: ${error.message || "Unknown error occurred"}` },
      { status: 500 }
    );
  }
}

export const revalidate = 0;
