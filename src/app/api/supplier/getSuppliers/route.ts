import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SupplierModel from "@/models/supplier";

export async function GET(req: Request) {
  await dbConnect();

  try {
    // Extract the 'search' parameter from the request URL
    const { search } = Object.fromEntries(new URL(req.url).searchParams);

    // Build the filter for search
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { materials: { $regex: search, $options: "i" } }, // Add material search
          ],
        }
      : {};

    // Fetch suppliers based on the filter
    const suppliers = await SupplierModel.find(filter, "name email phone materials").lean();
    
    return NextResponse.json(suppliers, { status: 200 });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { message: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}

export const revalidate = 0;
