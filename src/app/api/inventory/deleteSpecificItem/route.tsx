import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { InventoryItemModel } from "@/models/inventory";

export async function DELETE(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    const specificItemId = searchParams.get("specificItemId");

    if (!itemId || !specificItemId) {
      return NextResponse.json({ message: "Item ID and Specific Item ID are required." }, { status: 400 });
    }

    const updatedItem = await InventoryItemModel.findByIdAndUpdate(
      itemId,
      { $pull: { items: { specificItemId } } },
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json({ message: "Item not found." }, { status: 404 });
    }

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to delete specific item." }, { status: 500 });
  }
}
