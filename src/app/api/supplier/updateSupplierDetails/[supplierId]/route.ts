import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SupplierModel from "@/models/supplier";

export async function PUT(req: Request, { params }: { params: { supplierId: string } }) {
  await dbConnect();

  const { supplierId } = params;

  if (!supplierId) {
    return NextResponse.json({ message: "Supplier ID is required." }, { status: 400 });
  }

  try {
    const updatedData = await req.json();

    // Validate input data here if necessary
    const updatedSupplier = await SupplierModel.findByIdAndUpdate(
      supplierId,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedSupplier) {
      return NextResponse.json({ message: "Supplier not found." }, { status: 404 });
    }

    return NextResponse.json(updatedSupplier, { status: 200 });
  } catch (error) {
    console.error("Error updating supplier details:", error);

    // Check the type of error and provide a meaningful response
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred while updating supplier details.";

    return NextResponse.json(
      { message: "Error updating supplier details.", error: errorMessage },
      { status: 500 }
    );
  }
}
