// src/app/api/projects/create/route.ts
import { NextResponse } from "next/server";
import { Project } from "../../../../models";
import dbConnect from "../../../../lib/mongodb";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { name, description, startDate, endDate } = await req.json();
    const newProject = await Project.create({
      name,
      description,
      startDate,
      endDate,
    });
    return NextResponse.json(newProject, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: `Error creating a project: ${error.message || "Unknown error occurred"}`,
      },
      { status: 500 },
    );
  }
}
