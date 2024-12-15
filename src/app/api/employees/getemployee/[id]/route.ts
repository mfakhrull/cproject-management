import { NextResponse } from "next/server";
import Employee from "@/models/Employee";
import dbConnect from "@/lib/mongodb";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const employee = await Employee.findById(params.id);
    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    return NextResponse.json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 });
  }
}
