import { NextResponse } from "next/server";
import Leave from "@/models/Leave";
import Employee from "@/models/Employee";
import dbConnect from "@/lib/mongodb";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const { status } = await req.json();
    if (!["Approved", "Rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const leave = await Leave.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!leave) return NextResponse.json({ error: "Leave not found" }, { status: 404 });

    if (status === "Approved") {
      const leaveDays = Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 3600 * 24));
      await Employee.findByIdAndUpdate(leave.employeeId, {
        $inc: { "availability.vacationDaysRemaining": -leaveDays }
      });
    }

    return NextResponse.json(leave);
  } catch (error) {
    console.error("Error updating leave:", error);
    return NextResponse.json({ error: "Failed to update leave" }, { status: 500 });
  }
}
