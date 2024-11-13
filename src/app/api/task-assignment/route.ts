import { NextResponse } from 'next/server';
import TaskAssignment from '../../../models/TaskAssignment';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newTaskAssignment = await TaskAssignment.create(data);
    return NextResponse.json(newTaskAssignment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create TaskAssignment' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await TaskAssignment.findByIdAndDelete(id);
    return NextResponse.json({ message: 'TaskAssignment deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete TaskAssignment' }, { status: 500 });
  }
}
