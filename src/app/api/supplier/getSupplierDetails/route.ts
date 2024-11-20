import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SupplierModel from "@/models/supplier";

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const supplierId = searchParams.get("supplierId");

  if (!supplierId) {
    return NextResponse.json({ message: "Supplier ID is required." }, { status: 400 });
  }

  try {
    const supplier = await SupplierModel.findById(supplierId).lean();

    if (!supplier) {
      return NextResponse.json({ message: "Supplier not found." }, { status: 404 });
    }

    return NextResponse.json(supplier, { status: 200 });
  } catch (error) {
    console.error("Error fetching supplier details:", error);
    return NextResponse.json(
      { message: "Failed to fetch supplier details" },
      { status: 500 }
    );
  }
}
