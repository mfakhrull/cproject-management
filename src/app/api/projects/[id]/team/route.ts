import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Project } from "@/models";
import Employee from "@/models/Employee";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json({ message: "Project not found." }, { status: 404 });
    }

    // Find employees using employeeId as a string
    const employees = await Employee.find({ employeeId: { $in: project.teamMembers } });

    return NextResponse.json(employees, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching team members:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const { employeeId } = await req.json();

    // Add employeeId to the teamMembers array
    const project = await Project.findByIdAndUpdate(
      params.id,
      { $addToSet: { teamMembers: employeeId } }, 
      { new: true }
    );

    if (!project) {
      return NextResponse.json({ message: "Project not found." }, { status: 404 });
    }

    const employees = await Employee.find({ employeeId: { $in: project.teamMembers } });
    return NextResponse.json(employees, { status: 200 });
  } catch (error: any) {
    console.error("Error adding team member:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const { employeeId } = await req.json();

    // Remove employeeId from the teamMembers array
    const project = await Project.findByIdAndUpdate(
      params.id,
      { $pull: { teamMembers: employeeId } }, 
      { new: true }
    );

    if (!project) {
      return NextResponse.json({ message: "Project not found." }, { status: 404 });
    }

    const employees = await Employee.find({ employeeId: { $in: project.teamMembers } });
    return NextResponse.json(employees, { status: 200 });
  } catch (error: any) {
    console.error("Error removing team member:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
