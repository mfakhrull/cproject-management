import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SupplierModel from "@/models/supplier";

export async function POST(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const supplierId = searchParams.get("supplierId");

  if (!supplierId) {
    return NextResponse.json({ message: "Supplier ID is required." }, { status: 400 });
  }

  try {
    const { material } = await req.json();

    if (!material) {
      return NextResponse.json({ message: "Material is required." }, { status: 400 });
    }

    const updatedSupplier = await SupplierModel.findByIdAndUpdate(
      supplierId,
      { $push: { materials: material } },
      { new: true }
    );

    if (!updatedSupplier) {
      return NextResponse.json({ message: "Supplier not found." }, { status: 404 });
    }

    return NextResponse.json(updatedSupplier, { status: 200 });
  } catch (error) {
    console.error("Error updating supplier materials:", error);
    return NextResponse.json(
      { message: "Failed to update supplier materials" },
      { status: 500 }
    );
  }
}
