import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ContractorModel, { ContractorDocument } from "@/models/contractor";

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const contractorId = searchParams.get("contractorId");

  if (!contractorId) {
    return NextResponse.json({ message: "Contractor ID is required." }, { status: 400 });
  }

  try {
    // Explicitly type the result of the query as ContractorDocument
    const contractor = (await ContractorModel.findById(contractorId).lean()) as ContractorDocument | null;

    if (!contractor) {
      return NextResponse.json({ message: "Contractor not found." }, { status: 404 });
    }

    // Ensure array fields are always defined as empty arrays if null or undefined
    contractor.projectHistory = contractor.projectHistory || [];
    contractor.specialties = contractor.specialties || [];
    contractor.complianceDocs = contractor.complianceDocs || [];

    return NextResponse.json(contractor, { status: 200 });
  } catch (error) {
    console.error("Error fetching contractor details:", error);
    return NextResponse.json(
      { message: "Failed to fetch contractor details" },
      { status: 500 }
    );
  }
}
