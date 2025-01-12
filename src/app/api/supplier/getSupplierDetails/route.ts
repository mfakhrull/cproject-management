import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SupplierModel, { SupplierDocument } from "@/models/supplier";

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const supplierId = searchParams.get("supplierId");

  if (!supplierId) {
    return NextResponse.json({ message: "Supplier ID is required." }, { status: 400 });
  }

  try {
    // Explicitly type the result of the query as SupplierDocument
    const supplier = (await SupplierModel.findById(supplierId).lean()) as SupplierDocument | null;

    if (!supplier) {
      return NextResponse.json({ message: "Supplier not found." }, { status: 404 });
    }

    // Ensure array fields are always defined as empty arrays if null or undefined
    supplier.orderHistory = supplier.orderHistory || [];
    supplier.materials = supplier.materials || [];
    supplier.complianceDocs = supplier.complianceDocs || [];

    return NextResponse.json(supplier, { status: 200 });
  } catch (error) {
    console.error("Error fetching supplier details:", error);
    return NextResponse.json(
      { message: "Failed to fetch supplier details" },
      { status: 500 }
    );
  }
}

export const revalidate = 0;
