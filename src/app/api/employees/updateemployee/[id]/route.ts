import { NextResponse } from "next/server";
import Employee from "@/models/Employee";
import dbConnect from "@/lib/mongodb";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const employeeData = await req.json();
    const updatedEmployee = await Employee.findByIdAndUpdate(params.id, employeeData, {
      new: true,
    });

    if (!updatedEmployee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}
