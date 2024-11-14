// src/app/api/projects/read/route.ts
import { NextResponse } from 'next/server';
import { Project } from '../../../../models';
import dbConnect from "../../../../lib/mongodb";


export async function GET() {
  await dbConnect();

  try {
    const projects = await Project.find();
    return NextResponse.json(projects, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error retrieving projects: ${error.message || 'Unknown error occurred'}` },
      { status: 500 }
    );
  }
}
