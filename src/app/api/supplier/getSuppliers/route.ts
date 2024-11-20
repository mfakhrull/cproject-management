import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SupplierModel from "@/models/supplier";

export async function GET() {
  await dbConnect();

  try {
    const suppliers = await SupplierModel.find({}, "name email phone materials").lean();
    return NextResponse.json(suppliers, { status: 200 });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { message: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}
