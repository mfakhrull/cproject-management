import { NextResponse } from "next/server";
import Employee from "@/models/Employee";
import dbConnect from "@/lib/mongodb";

export async function GET() {
  await dbConnect();

  try {
    const employees = await Employee.find();
    return NextResponse.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}
