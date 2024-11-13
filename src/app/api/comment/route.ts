import { NextResponse } from 'next/server';
import CommentModel from '../../../models/Comment';
import dbConnect from '../../../lib/mongodb'; // Import dbConnect function

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    const newComment = await CommentModel.create(data);
    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (taskId) {
      const comments = await CommentModel.find({ taskId });
      return NextResponse.json(comments, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}
