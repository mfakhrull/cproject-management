import { NextResponse } from "next/server";
import Leave from "@/models/Leave";
import Employee from "@/models/Employee";
import dbConnect from "@/lib/mongodb";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    // Find the leave document by ID
    const leave = await Leave.findById(params.id);

    if (!leave) {
      return NextResponse.json(
        { error: "Leave application not found" },
        { status: 404 }
      );
    }

    // Manually fetch employee details based on employeeId
    const employee = await Employee.findOne({ employeeId: leave.employeeId });

    // Merge employee details into the leave object
    const leaveWithEmployeeDetails = {
      ...leave.toObject(),
      employeeDetails: employee
        ? { name: employee.name, role: employee.role }
        : null,
    };

    return NextResponse.json(leaveWithEmployeeDetails);
  } catch (error) {
    console.error("Error fetching leave details:", error);
    return NextResponse.json(
      { error: "Failed to fetch leave details" },
      { status: 500 }
    );
  }
}

export const revalidate = 0;
