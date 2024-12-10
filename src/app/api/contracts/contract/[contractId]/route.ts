import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ContractAnalysis from "@/models/ContractAnalysis";

export async function GET(req: Request, context: { params: { contractId: string } }) {
  const { contractId } = context.params;

  try {
    // Connect to the database
    await dbConnect();

    // Fetch the contract analysis by ID
    const contract = await ContractAnalysis.findById(contractId);

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(contract);
  } catch (error) {
    console.error("Error fetching contract:", error);
    return NextResponse.json(
      { error: "Failed to fetch contract" },
      { status: 500 }
    );
  }
}
