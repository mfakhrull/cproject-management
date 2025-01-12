import { NextResponse } from "next/server";
import { InventoryItemModel } from "@/models/inventory";
import dbConnect from "@/lib/mongodb";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    // Build the filter object
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { tags: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Dynamically calculate quantity based on items array length
    const items = await InventoryItemModel.aggregate([
      { $match: filter }, // Apply the filter
      {
        $project: {
          name: 1,
          location: 1,
          tags: 1,
          quantity: { $size: "$items" }, // Calculate the quantity as the length of items array
        },
      },
    ]);

    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    return NextResponse.json(
      { message: "Failed to fetch inventory items" },
      { status: 500 }
    );
  }
}

export const revalidate = 0;
