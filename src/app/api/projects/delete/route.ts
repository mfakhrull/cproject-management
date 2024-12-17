
import { NextResponse } from "next/server";
import { Project } from "@/models";
import dbConnect from "@/lib/mongodb";

export async function DELETE(req: Request) {
  await dbConnect();

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "Project ID is required" }, { status: 400 });
    }

    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting project:", error.message);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}
