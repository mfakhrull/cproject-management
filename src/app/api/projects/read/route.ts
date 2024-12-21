import { NextResponse } from 'next/server';
import { Project } from '../../../../models';
import dbConnect from "../../../../lib/mongodb";

export async function GET() {
  await dbConnect();

  try {
    // Filter projects where status is either 'PLANNING' or 'IN_PROGRESS'
    const projects = await Project.find({
      status: { $in: ['PLANNING', 'IN_PROGRESS'] }
    });
    return NextResponse.json(projects, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error retrieving projects: ${error.message || 'Unknown error occurred'}` },
      { status: 500 }
    );
  }
}
