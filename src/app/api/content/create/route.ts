// src/app/api/content/create/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb'; // Your MongoDB connection
import Content from '@/models/Content'; // Define a Mongoose model for content

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { title, body } = await req.json();

    const newContent = await Content.create({
      title,
      body,
    });

    return NextResponse.json(newContent, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: `Error saving content: ${error.message || 'Unknown error occurred'}`,
      },
      { status: 500 }
    );
  }
}
