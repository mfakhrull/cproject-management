import { NextResponse } from "next/server";
import Leave from "@/models/Leave";
import dbConnect from "@/lib/mongodb";

export async function DELETE(req: Request) {
  await dbConnect();

  try {
    const { id } = await req.json();

    const leave = await Leave.findByIdAndDelete(id);

    if (!leave) {
      return NextResponse.json({ error: "Leave application not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Leave application deleted successfully" });
  } catch (error) {
    console.error("Error deleting leave application:", error);
    return NextResponse.json({ error: "Failed to delete leave application" }, { status: 500 });
  }
}
