import { NextResponse } from "next/server";
import ContractAnalysis from "@/models/ContractAnalysis";
import {User} from "@/models"; // Import the User model
import dbConnect from "@/lib/mongodb";

export async function GET(req: Request) {
  try {
    // Connect to the database
    await dbConnect();

    // Fetch all contracts, sorted by createdAt in descending order
    const contracts = await ContractAnalysis.find()
      .sort({ createdAt: -1 }) // Newest contracts first
      .lean();

    if (contracts.length === 0) {
      return NextResponse.json(
        { error: "No contracts found" },
        { status: 404 },
      );
    }

    // Get all unique user IDs from the contracts
    const userIds = [...new Set(contracts.map((contract) => contract.userId))];

    // Fetch user details for all user IDs
    const users = await User.find({ clerk_id: { $in: userIds } })
      .select("clerk_id username")
      .lean();

    // Create a mapping of clerkId to username
    const userMap = users.reduce(
      (map, user) => {
        map[user.clerk_id] = user.username;
        return map;
      },
      {} as Record<string, string>,
    );

    // Include the username in each contract
    const contractsWithUsername = contracts.map((contract) => ({
      ...contract,
      username: userMap[contract.userId] || "Unknown",
    }));

    return NextResponse.json(contractsWithUsername);
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
      { status: 500 },
    );
  }
}

export const revalidate = 0;
