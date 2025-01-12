// src/app/api/tasks/getTasks/route.ts
import { NextResponse } from "next/server";
import { Task } from "../../../../models";
import dbConnect from "../../../../lib/mongodb";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    let tasks;

    if (projectId) {
      // Fetch tasks for the specified project ID
      tasks = await Task.find({ projectId });
      console.log(`Tasks fetched for project ${projectId}:`, tasks.length);
    } else {
      // Fetch all tasks if no project ID is provided
      tasks = await Task.find();
      console.log(`All tasks fetched:`, tasks.length);
    }

    return NextResponse.json(tasks, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching tasks:", error.message || error);
    return NextResponse.json(
      { message: `Error retrieving tasks: ${error.message || "Unknown error occurred"}` },
      { status: 500 }
    );
  }
}

export const revalidate = 0;
