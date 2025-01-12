import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ContractorModel from "@/models/contractor";

export async function PUT(req: Request, { params }: { params: { contractorId: string } }) {
  await dbConnect();

  const { contractorId } = params;

  if (!contractorId) {
    return NextResponse.json({ message: "Contractor ID is required." }, { status: 400 });
  }

  try {
    const updatedData = await req.json();

    // Validate input data here if necessary
    const updatedContractor = await ContractorModel.findByIdAndUpdate(
      contractorId,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedContractor) {
      return NextResponse.json({ message: "Contractor not found." }, { status: 404 });
    }

    return NextResponse.json(updatedContractor, { status: 200 });
  } catch (error) {
    console.error("Error updating contractor details:", error);

    // Check the type of error and provide a meaningful response
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred while updating contractor details.";

    return NextResponse.json(
      { message: "Error updating contractor details.", error: errorMessage },
      { status: 500 }
    );
  }
}
