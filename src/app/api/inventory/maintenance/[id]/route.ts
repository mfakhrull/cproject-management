import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { InventoryItemModel } from "@/models/inventory";

interface MaintenanceItem {
  specificItemId: string;
  maintenanceSchedule: Date;
  maintenanceType?: string[];
  maintenanceHistory?: { date: Date; maintenanceType: string[] }[];
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  const { id } = params;
  const { newDate, history } = await req.json();

  try {
    const inventoryItem = await InventoryItemModel.findOne({
      "items.specificItemId": id,
    });

    if (!inventoryItem) {
      return NextResponse.json({ message: "Item not found." }, { status: 404 });
    }

    const itemIndex = inventoryItem.items.findIndex(
      (item: MaintenanceItem) => item.specificItemId === id
    );

    if (itemIndex === -1) {
      return NextResponse.json({ message: "Item not found." }, { status: 404 });
    }

    // Update the item's maintenance schedule
    inventoryItem.items[itemIndex].maintenanceSchedule = new Date(newDate);

    // Update the maintenance history if provided
    if (history) {
      inventoryItem.items[itemIndex].maintenanceHistory = [
        ...(inventoryItem.items[itemIndex].maintenanceHistory || []),
        {
          date: new Date(history.date),
          maintenanceType: history.maintenanceType,
        },
      ];
    }

    await inventoryItem.save();

    return NextResponse.json({ message: "Maintenance schedule updated successfully." });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to update maintenance schedule." },
      { status: 500 }
    );
  }
}
