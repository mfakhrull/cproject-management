import { NextResponse } from "next/server";
import Leave from "@/models/Leave";
import Employee from "@/models/Employee";
import dbConnect from "@/lib/mongodb";

export async function GET() {
  await dbConnect();

  try {
    // Fetch all leaves
    const leaves = await Leave.find();

    // Fetch employee details for each leave
    const leavesWithEmployeeDetails = await Promise.all(
      leaves.map(async (leave) => {
        const employee = await Employee.findOne({ employeeId: leave.employeeId });
        return {
          ...leave.toObject(),
          employeeName: employee ? employee.name : "N/A", // Add employee name
        };
      })
    );

    return NextResponse.json(leavesWithEmployeeDetails, { status: 200 });
  } catch (error) {
    console.error("Error fetching leaves:", error);
    return NextResponse.json({ error: "Failed to fetch leave requests" }, { status: 500 });
  }
}
