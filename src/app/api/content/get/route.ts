import { NextResponse } from 'next/server';
import Content from '@/models/Content';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  await dbConnect();

  try {
    const content = await Content.find({});
    return NextResponse.json(content, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error fetching content: ${error.message || 'Unknown error occurred'}` },
      { status: 500 }
    );
  }
}
