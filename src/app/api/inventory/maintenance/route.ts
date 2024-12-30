import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { InventoryItemModel } from "@/models/inventory";

interface MaintenanceItem {
  specificItemId: string;
  maintenanceSchedule: Date;
  location: string;
  maintenanceType?: string[];
  status: "Overdue" | "Pending" | "OK";
  parentItemName: string;
  parentItemId: string; // Added parentItemId
}

export async function GET(req: Request): Promise<NextResponse> {
  await dbConnect();

  try {
    const currentDate = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(currentDate.getDate() + 30);

    const items = await InventoryItemModel.find({
      "items.maintenanceSchedule": { $exists: true },
    });

    const filteredItems: MaintenanceItem[] = items.flatMap((inventory) => {
      const maintenanceItems = inventory.items
        .map((item: any): MaintenanceItem => {
          const schedule = new Date(item.maintenanceSchedule);
          const status: MaintenanceItem["status"] =
            schedule < currentDate
              ? "Overdue"
              : schedule <= thirtyDaysLater
              ? "Pending"
              : "OK";

          return {
            specificItemId: item.specificItemId,
            maintenanceSchedule: schedule,
            location: item.location,
            maintenanceType: item.maintenanceType || [],
            status,
            parentItemName: inventory.name, // Include parent inventory item's name
            parentItemId: inventory._id.toString(), // Add parent item ID
          };
        })
        .filter((item: MaintenanceItem) => item.status !== "OK");

      return maintenanceItems;
    });

    return NextResponse.json(filteredItems);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch inventory items.", error: error.message },
      { status: 500 }
    );
  }
}
