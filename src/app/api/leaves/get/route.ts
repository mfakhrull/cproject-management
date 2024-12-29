import { NextResponse } from "next/server";
import Leave from "@/models/Leave";
import dbConnect from "@/lib/mongodb";

export async function GET(req: Request) {
  await dbConnect();

  const url = new URL(req.url);
  const employeeId = url.searchParams.get("employeeId");

  if (!employeeId) {
    return NextResponse.json(
      { error: "Missing employeeId in query parameters" },
      { status: 400 }
    );
  }

  try {
    // Fetch leaves for the specific employee
    const leaves = await Leave.find({ employeeId });

    return NextResponse.json(leaves, { status: 200 });
  } catch (error) {
    console.error("Error fetching leaves:", error);
    return NextResponse.json(
      { error: "Failed to fetch leave requests" },
      { status: 500 }
    );
  }
}
