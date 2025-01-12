import { NextRequest, NextResponse } from "next/server";
import { Task, Project, User } from "../../../../models"; // Ensure User is imported
import dbConnect from "../../../../lib/mongodb";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const permissionsHeader = req.headers.get("permissions");
    const employeeId = req.headers.get("employeeId");
    const { userId: clerkId } = getAuth(req);

    if (!permissionsHeader || !employeeId) {
      throw new Error("Missing permissions or employeeId in the request headers.");
    }

    const permissions = JSON.parse(permissionsHeader);
    const isAdmin = permissions.includes("admin");
    const isProjectManager = permissions.includes("project_manager");

    let tasks;

    if (isAdmin) {
      tasks = await Task.find({});
    } else if (isProjectManager) {
      const managedProjects = await Project.find({ managerId: employeeId }).select("_id");
      const projectIds = managedProjects.map((project) => project._id);

      tasks = await Task.find({
        projectId: { $in: projectIds },
      });
    } else {
      tasks = await Task.find({
        assignedUserIds: { $in: [clerkId] },
      });
    }

    if (projectId) {
      tasks = tasks.filter((task) => task.projectId.toString() === projectId);
    }

    // Populate author and assignee names
    const tasksWithUserDetails = await Promise.all(
      tasks.map(async (task) => {
        const author = await User.findOne({ clerk_id: task.authorId }).select("username");
        const assignees = await User.find({ clerk_id: { $in: task.assignedUserIds } }).select(
          "username"
        );

        return {
          ...task.toObject(),
          authorName: author ? author.username : "Unknown",
          assigneeNames: assignees.map((assignee) => assignee.username),
        };
      })
    );
    return NextResponse.json(tasksWithUserDetails, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching tasks:", error.message || error);
    return NextResponse.json(
      { message: `Error retrieving tasks: ${error.message || "Unknown error occurred"}` },
      { status: 500 }
    );
  }
}

export const revalidate = 0;
