import { NextRequest, NextResponse } from "next/server";
import { Task, Project } from "../../../../models"; // Assuming Task and Project models are exported here
import dbConnect from "../../../../lib/mongodb";
import { getAuth } from "@clerk/nextjs/server"; // Use server-side getAuth for Clerk

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const permissionsHeader = req.headers.get("permissions");
    const employeeId = req.headers.get("employeeId"); // Ensure the client includes this header
    const { userId: clerkId } = getAuth(req);

    if (!permissionsHeader || !employeeId) {
      throw new Error("Missing permissions or employeeId in the request headers.");
    }

    const permissions = JSON.parse(permissionsHeader);
    const isAdmin = permissions.includes("admin");
    const isProjectManager = permissions.includes("project_manager");

    let tasks;

    if (isAdmin) {
      // Fetch all tasks for admin
      tasks = await Task.find({});
      console.log(`Admin fetched all tasks: ${tasks.length}`);
    } else if (isProjectManager) {
      // Fetch tasks under projects managed by the project manager
      const managedProjects = await Project.find({ managerId: employeeId }).select("_id");
      const projectIds = managedProjects.map((project) => project._id);

      tasks = await Task.find({
        projectId: { $in: projectIds },
      });
      console.log(`Project Manager fetched tasks: ${tasks.length}`);
    } else {
      // Fetch only tasks assigned to the user
      tasks = await Task.find({
        assignedUserIds: { $in: [clerkId] },
      });
      console.log(`User fetched assigned tasks: ${tasks.length}`);
    }

    // If projectId is provided, filter tasks further
    if (projectId) {
      tasks = tasks.filter((task) => task.projectId.toString() === projectId);
      console.log(`Filtered tasks for project ${projectId}: ${tasks.length}`);
    }

    return NextResponse.json(tasks, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching tasks:", error.message || error);
    return NextResponse.json(
      { message: `Error retrieving tasks: ${error.message || "Unknown error occurred"}` },
      { status: 500 }
    );
  }
}

export const revalidate = 0;
