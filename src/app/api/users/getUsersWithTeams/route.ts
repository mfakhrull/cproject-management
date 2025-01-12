import { NextResponse } from "next/server";
import { User, Team } from "../../../../models";
import dbConnect from "../../../../lib/mongodb";

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortField = searchParams.get("sort") || "username";
  const sortOrder = searchParams.get("order") === "desc" ? -1 : 1;

  try {
    const skip = (page - 1) * limit;

    // Populate `teamName` in User
    const users = await User.aggregate([
      { $lookup: {
        from: "teams",
        localField: "teamId",
        foreignField: "_id",
        as: "teamInfo"
      }},
      { $addFields: {
        teamName: { $arrayElemAt: ["$teamInfo.teamName", 0] }
      }},
      { $project: { teamInfo: 0 } }, // Remove the joined array to clean the result
      { $sort: { [sortField]: sortOrder } },
      { $skip: skip },
      { $limit: limit }
    ]);

    const totalUsers = await User.countDocuments();

    return NextResponse.json({ users, totalUsers }, { status: 200 });
  } catch (error: any) {
    console.error("Error in /api/users/getUsersWithTeams:", error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}

export const revalidate = 0;
