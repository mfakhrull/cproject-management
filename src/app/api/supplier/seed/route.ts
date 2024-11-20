import { NextResponse } from "next/server";
import seedSuppliers from "@/lib/seedSupplier";

export async function POST() {
  try {
    await seedSuppliers();
    return NextResponse.json(
      { message: "Suppliers seeded successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in supplier seeding API:", error);
    return NextResponse.json(
      { message: "Failed to seed suppliers." },
      { status: 500 }
    );
  }
}
