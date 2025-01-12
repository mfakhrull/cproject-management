import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ContractorModel from "@/models/contractor";

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
            { specialties: { $regex: search, $options: "i" } }, // Add specialties search
          ],
        }
      : {};

    // Fetch contractors based on the filter
    const contractors = await ContractorModel.find(filter, "name email phone specialties").lean();

    return NextResponse.json(contractors, { status: 200 });
  } catch (error) {
    console.error("Error fetching contractors:", error);
    return NextResponse.json(
      { message: "Failed to fetch contractors" },
      { status: 500 }
    );
  }
}
