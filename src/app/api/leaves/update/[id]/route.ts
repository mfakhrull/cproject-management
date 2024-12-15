import { NextResponse } from "next/server";
import Leave from "@/models/Leave";
import Employee from "@/models/Employee";
import dbConnect from "@/lib/mongodb";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const { status } = await req.json();

    // Validate status
    if (!["Approved", "Rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Find and update the leave status
    const leave = await Leave.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!leave) {
      return NextResponse.json({ error: "Leave application not found" }, { status: 404 });
    }

    // If leave is approved, calculate the leave days and reduce vacation days for the employee
    if (status === "Approved") {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      
      // Calculate the number of leave days (inclusive of both start and end date)
      const leaveDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;

      // Reduce employee's vacation days remaining (based on employeeId as a string, not ObjectId)
      const employee = await Employee.findOneAndUpdate(
        { employeeId: leave.employeeId }, // Since employeeId is a string, we use findOneAndUpdate
        { $inc: { "availability.vacationDaysRemaining": -leaveDays } },
        { new: true }
      );

      if (!employee) {
        console.error(`Employee with ID ${leave.employeeId} not found.`);
        return NextResponse.json({ error: "Employee not found" }, { status: 404 });
      }
    }

    return NextResponse.json(leave);
  } catch (error) {
    console.error("Error updating leave status:", error);
    return NextResponse.json({ error: "Failed to update leave status" }, { status: 500 });
  }
}
