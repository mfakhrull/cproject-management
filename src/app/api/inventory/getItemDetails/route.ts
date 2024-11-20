import { NextResponse } from "next/server";
import { InventoryItemModel } from "@/models/inventory";
import dbConnect from "@/lib/mongodb";

export async function GET(req: Request) {
  await dbConnect();

  const url = new URL(req.url);
  const itemId = url.searchParams.get("itemId");

  if (!itemId) {
    return NextResponse.json(
      { message: "Item ID is required" },
      { status: 400 }
    );
  }

  try {
    const item = await InventoryItemModel.findById(itemId).lean();

    if (!item) {
      return NextResponse.json(
        { message: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error("Error fetching item details:", error);
    return NextResponse.json(
      { message: "Failed to fetch item details" },
      { status: 500 }
    );
  }
}
