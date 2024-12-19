import { NextResponse } from "next/server";
import { Project } from "@/models"; 
import Employee from "@/models/Employee"; // Import the Employee model
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

    // Manually fetch employees for teamMembers
    const teamMembers = await Employee.find({
      employeeId: { $in: project.teamMembers }, // Match `employeeId` with `teamMembers`
    }).select("name employeeId role");

    // Attach teamMembers data to the project
    const projectWithTeamMembers = {
      ...project.toObject(),
      teamMembers, // Replace teamMembers with the full employee objects
    };

    return NextResponse.json(projectWithTeamMembers);
  } catch (error: any) {
    console.error("Error fetching project details:", error);
    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
  }
}
