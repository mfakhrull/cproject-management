import { NextResponse } from "next/server";
import { InventoryItemModel } from "@/models/inventory";
import dbConnect from "@/lib/mongodb";

export async function PUT(request: Request) {
  await dbConnect();

  try {
    const { itemId, name, description, tags } = await request.json();

    const updatedItem = await InventoryItemModel.findByIdAndUpdate(
      itemId,
      { name, description, tags },
      { new: true }
    );

    if (!updatedItem) throw new Error("Item not found");

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json({ message: "Failed to update item" }, { status: 500 });
  }
}
