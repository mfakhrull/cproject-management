// src/app/api/teams/getTeams/route.ts
import { NextResponse } from "next/server";
import { Team } from "../../../../models";
import { IUser } from "../../../../types";
import dbConnect from "../../../../lib/mongodb";
import { Document } from "mongoose";

export async function GET() {
  await dbConnect();

  try {
    const teams = await Team.find()
      .populate("productOwnerId", "username") // Populate only the username field for productOwner
      .populate("projectManagerId", "username"); // Populate only the username field for projectManager

    const teamsWithUsernames = teams.map((team: Document & { toObject: () => any }) => {
      const teamObject = team.toObject(); // Convert Mongoose document to a plain object
      const productOwner = teamObject.productOwnerId as unknown as IUser; // Cast to `unknown` first, then to `IUser`
      const projectManager = teamObject.projectManagerId as unknown as IUser; // Cast to `unknown` first, then to `IUser`

      return {
        ...teamObject,
        productOwnerUsername: productOwner?.username,
        projectManagerUsername: projectManager?.username,
      };
    });

    return NextResponse.json(teamsWithUsernames, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error retrieving teams: ${error.message || "Unknown error occurred"}` },
      { status: 500 }
    );
  }
}
