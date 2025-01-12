import { NextRequest, NextResponse } from 'next/server';
import { Project } from '../../../../models';
import dbConnect from "../../../../lib/mongodb";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const permissionsHeader = req.headers.get("permissions");
    const employeeId = req.headers.get("employeeId");
    const { userId: clerkId } = getAuth(req);

    if (!permissionsHeader || !employeeId) {
      throw new Error("Missing permissions or employeeId in the request headers.");
    }

    const permissions = JSON.parse(permissionsHeader);
    const isAdmin = permissions.includes("admin");
    const isProjectManager = permissions.includes("project_manager");

    let projects;

    if (isAdmin) {
      // Fetch all projects for admin
      projects = await Project.find({
        status: { $in: ['PLANNING', 'IN_PROGRESS'] }
      });
      console.log(`Admin fetched all projects: ${projects.length}`);
    } else if (isProjectManager) {
      // Fetch projects managed by the project manager
      projects = await Project.find({
        managerId: employeeId,
        status: { $in: ['PLANNING', 'IN_PROGRESS'] }
      });
      console.log(`Project Manager fetched managed projects: ${projects.length}`);
    } else {
      // Fetch projects where user is a team member
      projects = await Project.find({
        teamMembers: employeeId,
        status: { $in: ['PLANNING', 'IN_PROGRESS'] }
      });
      console.log(`User fetched team member projects: ${projects.length}`);
    }

    return NextResponse.json(projects, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching projects:", error.message || error);
    return NextResponse.json(
      { message: `Error retrieving projects: ${error.message || 'Unknown error occurred'}` },
      { status: 500 }
    );
  }
}

export const revalidate = 0;
