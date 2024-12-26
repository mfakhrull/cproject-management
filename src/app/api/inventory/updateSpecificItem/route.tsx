import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { InventoryItemModel } from "@/models/inventory";

export async function PUT(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { itemId, specificItemId, price, location, maintenanceSchedule } = body;

    const updatedItem = await InventoryItemModel.findOneAndUpdate(
      { _id: itemId, "items.specificItemId": specificItemId },
      {
        $set: {
          "items.$.price": price,
          "items.$.location": location,
          "items.$.maintenanceSchedule": maintenanceSchedule,
        },
      },
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json({ message: "Item not found." }, { status: 404 });
    }

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to update specific item." }, { status: 500 });
  }
}
