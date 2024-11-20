import { NextResponse } from "next/server";
import { InventoryItemModel } from "@/models/inventory";
import dbConnect from "@/lib/mongodb";

export async function GET() {
  await dbConnect();

  try {
    // Dynamically calculate quantity based on items array length
    const items = await InventoryItemModel.aggregate([
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
