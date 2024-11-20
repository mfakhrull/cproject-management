import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { InventoryItemModel } from "@/models/inventory";

export async function POST(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");

  if (!itemId) {
    return NextResponse.json({ message: "Item ID is required." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { specificItemId, price, location, maintenanceSchedule } = body;

    if (!specificItemId || !price || !location || !maintenanceSchedule) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    // Update the item and fetch the updated document
    const updatedItem = await InventoryItemModel.findByIdAndUpdate(
      itemId,
      {
        $push: {
          items: { specificItemId, price, location, maintenanceSchedule },
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedItem) {
      return NextResponse.json({ message: "Item not found." }, { status: 404 });
    }

    // Return the updated item
    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error("Error adding specific item:", error);
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}
