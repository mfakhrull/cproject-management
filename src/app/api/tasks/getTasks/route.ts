// src/app/api/tasks/getTasks/route.ts
import { NextResponse } from "next/server";
import { Task } from "../../../../models";
import dbConnect from "../../../../lib/mongodb";
import { Types } from "mongoose";

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId || !Types.ObjectId.isValid(projectId)) {
    return NextResponse.json(
      { message: "Invalid or missing projectId" },
      { status: 400 }
    );
  }

  try {
    const tasks = await Task.find({ projectId: new Types.ObjectId(projectId) });
    return NextResponse.json(tasks, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error retrieving tasks: ${error.message || "Unknown error occurred"}` },
      { status: 500 }
    );
  }
}
