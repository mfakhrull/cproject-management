import { NextResponse } from "next/server";
import Leave from "@/models/Leave";
import dbConnect from "@/lib/mongodb";

// Generate unique leaveId
async function generateLeaveId(): Promise<string> {
  return `LEAVE-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { employeeId, startDate, endDate, leaveType, reason } = await req.json();

    if (!employeeId || !startDate || !endDate || !leaveType || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const leaveId = await generateLeaveId();

    const newLeave = await Leave.create({
      leaveId,
      employeeId,
      startDate,
      endDate,
      leaveType,
      reason,
    });

    return NextResponse.json(newLeave, { status: 201 });
  } catch (error) {
    console.error("Error creating leave request:", error);
    return NextResponse.json({ error: "Failed to create leave request" }, { status: 500 });
  }
}

export async function GET() {
  await dbConnect();

  try {
    const leaves = await Leave.find().populate("employeeId", "name role contact.email");
    return NextResponse.json(leaves);
  } catch (error) {
    console.error("Error fetching leaves:", error);
    return NextResponse.json({ error: "Failed to fetch leave requests" }, { status: 500 });
  }
}

export const revalidate = 0;
