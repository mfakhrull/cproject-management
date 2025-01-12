import { NextResponse } from "next/server";
import { NextRequest } from "next/server"; // Import NextRequest
import dbConnect from "@/lib/mongodb";
import {User} from "@/models"; // Ensure you import User correctly
import Employee from "@/models/Employee";
import { getAuth } from "@clerk/nextjs/server"; // Use server-side getAuth for Clerk

export async function GET(req: NextRequest) {
  await dbConnect(); // Ensure the database is connected

  try {
    // Get the authenticated user's Clerk ID
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the User document using the Clerk ID
    const user = await User.findOne({ clerk_id: clerkId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Extract the employeeId from the User document
    const { employeeId } = user;
    console.log(employeeId);
    

    if (!employeeId) {
      return NextResponse.json({ error: "No employee ID found for this user" }, { status: 404 });
    }

    // Find the Employee document using the employeeId
    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Return the employee data
    return NextResponse.json(employee);
  } catch (error) {
    console.error("Error fetching employee data:", error);
    return NextResponse.json({ error: "Failed to fetch employee data" }, { status: 500 });
  }
}

export const revalidate = 0;
