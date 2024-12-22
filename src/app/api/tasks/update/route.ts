import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import {Task} from "@/models";

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const { id, updates } = await req.json(); // `id` and `updates` should be in the request body

    const task = await Task.findByIdAndUpdate(id, updates, { new: true });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
