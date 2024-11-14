// src/app/api/search/route.ts
import { NextResponse } from 'next/server';
import { Task, Project, User } from '../../../models';
import dbConnect from "../../../lib/mongodb";



export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');

  // Ensure query parameter is provided and is a non-empty string
  if (!query) {
    return NextResponse.json(
      { message: "Query parameter is required and must be a non-empty string." },
      { status: 400 }
    );
  }

  try {
    // Full-text search across Task, Project, and User collections
    const tasks = await Task.find({ $text: { $search: query } });
    const projects = await Project.find({ $text: { $search: query } });
    const users = await User.find({ $text: { $search: query } });

    return NextResponse.json({ tasks, projects, users }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error performing search: ${error.message || 'Unknown error occurred'}` },
      { status: 500 }
    );
  }
}
