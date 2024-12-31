import { NextResponse } from "next/server";
import { Project } from "@/models"; // Adjust path as needed
import { User } from "@/models"; // Import the User model
import dbConnect from "@/lib/mongodb";

export async function GET() {
  await dbConnect();

  try {
    // Fetch projects with status COMPLETED
    const projects = await Project.find({ status: "COMPLETED" })
      .select("name description startDate endDate location status managerId");

    // Manually fetch manager usernames for each project
    const projectsWithManagers = await Promise.all(
      projects.map(async (project) => {
        const manager = await User.findOne(
          { employeeId: project.managerId }, // Match managerId to clerk_id
          "username" // Only fetch the username
        );

        return {
          ...project.toObject(),
          managerName: manager?.username || "Unknown Manager",
        };
      })
    );
console.log(projectsWithManagers);
    return NextResponse.json(projectsWithManagers, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching completed projects:", error.message);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}
