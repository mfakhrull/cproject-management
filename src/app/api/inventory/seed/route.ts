import seedInventory from "@/lib/seedInventory";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await seedInventory();
    return NextResponse.json({ message: "Seeding completed successfully." });
  } catch (error) {
    console.error("Error during seeding:", error);
    return NextResponse.json({ message: "Failed to seed data." }, { status: 500 });
  }
}
