// src/app/api/tasks/create/route.ts
import { NextResponse } from "next/server";
import { Task } from "../../../../models";
import dbConnect from "../../../../lib/mongodb";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const {
      title,
      description,
      status,
      priority,
      tags,
      startDate,
      dueDate,
      points,
      projectId,
      authorUserId,
      assignedUserId,
    } = await req.json();

    const newTask = await Task.create({
      title,
      description,
      status,
      priority,
      tags,
      startDate,
      dueDate,
      points,
      projectId,
      authorId: authorUserId,
      assignedUserId,
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: `Error creating a task: ${error.message || "Unknown error occurred"}`,
      },
      { status: 500 }
    );
  }
}
