import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SupplierModel from "@/models/supplier";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { name, email, phone, materials } = await req.json();

    if (!name || !email || !phone) {
      return NextResponse.json({ message: "Name, email, and phone are required." }, { status: 400 });
    }

    const newSupplier = new SupplierModel({
      name,
      email,
      phone,
      materials: materials || [],
    });

    await newSupplier.save();

    return NextResponse.json(newSupplier, { status: 201 });
  } catch (error) {
    console.error("Error adding supplier:", error);
    return NextResponse.json(
      { message: "Failed to add supplier" },
      { status: 500 }
    );
  }
}
