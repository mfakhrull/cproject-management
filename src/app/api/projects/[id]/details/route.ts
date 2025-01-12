import { NextResponse } from "next/server";
import { Project } from "@/models";
import Employee from "@/models/Employee";
import dbConnect from "@/lib/mongodb";

export async function GET(req: Request, context: { params: { id: string } }) {
  await dbConnect();

  const { params } = context;

  try {
    // Fetch the project by ID
    const project = await Project.findById(params.id).exec();

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    // Fetch manager details
    const manager = await Employee.findOne({
      employeeId: project.managerId, // Match `managerId` with `employeeId`
    }).select("name employeeId role");

    // Fetch teamMembers details
    const teamMembers = await Employee.find({
      employeeId: { $in: project.teamMembers }, // Match `employeeId` with `teamMembers`
    }).select("name employeeId role");

    // Attach manager and teamMembers data to the project
    const projectWithDetails = {
      ...project.toObject(),
      manager, // Include manager details
      teamMembers, // Include teamMembers details
    };

    return NextResponse.json(projectWithDetails);
  } catch (error: any) {
    console.error("Error fetching project details:", error);
    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
  }
}

export const revalidate = 0;
