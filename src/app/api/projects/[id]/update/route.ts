import { NextResponse } from "next/server";
import { Project } from "@/models";
import dbConnect from "@/lib/mongodb";

export async function PUT(req: Request, context: { params: { id: string } }) {
  await dbConnect();
  
  const { id } = context.params;
  const updateData = await req.json();

  try {
    const allowedFields = [
      'name', 
      'description', 
      'startDate', 
      'endDate', 
      'extendedDate', 
      'location', 
      'status', 
      'managerId'
    ];

    // Filter out only the fields that are allowed to be updated
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([key]) => allowedFields.includes(key))
    );

    const updatedProject = await Project.findByIdAndUpdate(
      id, 
      { $set: filteredUpdateData }, 
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return NextResponse.json(
        { message: 'Project not found.' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProject);
  } catch (error: any) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { message: `Error updating project: ${error.message}` },
      { status: 500 }
    );
  }
}
