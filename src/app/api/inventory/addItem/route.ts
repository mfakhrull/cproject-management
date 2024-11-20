import { NextResponse } from "next/server";
import { InventoryItemModel } from "@/models/inventory";
import dbConnect from "@/lib/mongodb";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const newItem = await InventoryItemModel.create(body);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error adding item:", error);
    return NextResponse.json({ message: "Failed to add item" }, { status: 500 });
  }
}
