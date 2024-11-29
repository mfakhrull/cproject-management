import { NextResponse } from 'next/server';
import Content from '@/models/Content';
import dbConnect from '@/lib/mongodb';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { title, body } = await req.json();

    const newContent = await Content.create({ title, body });

    return NextResponse.json(newContent, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error creating content: ${error.message || 'Unknown error occurred'}` },
      { status: 500 }
    );
  }
}
