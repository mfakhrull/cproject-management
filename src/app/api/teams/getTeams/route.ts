import { NextResponse } from "next/server";
import { Team } from "../../../../models";
import { IUser } from "../../../../types";
import dbConnect from "../../../../lib/mongodb";
import { Document } from "mongoose";

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10); // Default to page 1
  const limit = parseInt(searchParams.get("limit") || "10", 10); // Default to 10 items per page
  const sortField = searchParams.get("sort") || "teamName"; // Default to sorting by teamName
  const sortOrder = searchParams.get("order") === "desc" ? -1 : 1; // Default to ascending order

  try {
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    // Fetch teams with pagination and sorting
    const teams = await Team.find()
      .populate("productOwnerId", "username") // Populate username for productOwner
      .populate("projectManagerId", "username") // Populate username for projectManager
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    // Format teams with populated usernames
    const teamsWithUsernames = teams.map((team: Document & { toObject: () => any }) => {
      const teamObject = team.toObject(); // Convert Mongoose document to plain object
      const productOwner = teamObject.productOwnerId as unknown as IUser; // Cast productOwnerId to IUser
      const projectManager = teamObject.projectManagerId as unknown as IUser; // Cast projectManagerId to IUser

      return {
        ...teamObject,
        productOwnerUsername: productOwner?.username || "N/A",
        projectManagerUsername: projectManager?.username || "N/A",
      };
    });

    // Count total teams for pagination metadata
    const totalTeams = await Team.countDocuments();

    return NextResponse.json(
      { teams: teamsWithUsernames, totalTeams },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in /api/teams/getTeams:", error);
    return NextResponse.json(
      { message: `Error retrieving teams: ${error.message || "Unknown error occurred"}` },
      { status: 500 }
    );
  }
}
