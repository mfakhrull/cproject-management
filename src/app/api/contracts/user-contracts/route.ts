import { NextResponse } from "next/server";
import ContractAnalysis from "@/models/ContractAnalysis";
import dbConnect from "@/lib/mongodb";

export async function GET(req: Request) {
  try {
    // Connect to the database
    await dbConnect();

    // Extract userId from query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId in query parameters" },
        { status: 400 }
      );
    }

    // Fetch contracts for the user
    const contracts = await ContractAnalysis.find({ userId });

    return NextResponse.json(contracts);
  } catch (error) {
    console.error("Error fetching user contracts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
      { status: 500 }
    );
  }
}
