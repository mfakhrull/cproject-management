import { NextRequest, NextResponse } from "next/server";
import { Project, Task } from "../../../../models"; // Import Task model
import dbConnect from "../../../../lib/mongodb";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const permissionsHeader = req.headers.get("permissions");
    const employeeId = req.headers.get("employeeId");
    const { userId: clerkId } = getAuth(req);

    if (!permissionsHeader || !employeeId) {
      throw new Error(
        "Missing permissions or employeeId in the request headers."
      );
    }

    const permissions = JSON.parse(permissionsHeader);
    const isAdmin = permissions.includes("admin");
    const isProjectManager = permissions.includes("project_manager");

    let projects;

    if (isAdmin) {
      // Fetch all projects for admin
      projects = await Project.find({
        status: { $in: ["PLANNING", "IN_PROGRESS"] },
      });
    } else if (isProjectManager) {
      // Fetch projects managed by the project manager
      projects = await Project.find({
        managerId: employeeId,
        status: { $in: ["PLANNING", "IN_PROGRESS"] },
      });
    } else {
      // Fetch projects where user is a team member
      projects = await Project.find({
        teamMembers: employeeId,
        status: { $in: ["PLANNING", "IN_PROGRESS"] },
      });
    }

    // Calculate progress for each project
    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ projectId: project._id });

        // Calculate progress dynamically based on task statuses
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(
          (task) => task.status === "COMPLETED"
        ).length;

        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        return {
          ...project.toObject(),
          progress: Math.round(progress), // Return progress as a rounded percentage
        };
      })
    );

    return NextResponse.json(projectsWithProgress, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching projects:", error.message || error);
    return NextResponse.json(
      {
        message: `Error retrieving projects: ${
          error.message || "Unknown error occurred"
        }`,
      },
      { status: 500 }
    );
  }
}
