import { NextResponse } from "next/server";
import Employee from "@/models/Employee";
import dbConnect from "@/lib/mongodb";

// Function to generate a unique employeeId
async function generateEmployeeId(): Promise<string> {
  const generateRandomId = () => {
    const letters = Array.from({ length: 3 }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join("");
    const numbers = Array.from({ length: 3 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");
    return `${letters}${numbers}`;
  };

  let unique = false;
  let employeeId = "";

  while (!unique) {
    employeeId = generateRandomId();
    const existingEmployee = await Employee.findOne({ employeeId });
    if (!existingEmployee) {
      unique = true;
    }
  }

  return employeeId;
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const {
      name,
      role,
      contact: { email, phone },
      availability: { hoursPerWeek, shiftPreference, vacationDaysRemaining },
    } = await req.json();

    // Ensure all required data is present
    if (!name || !role || !email || !phone || !hoursPerWeek || !shiftPreference || vacationDaysRemaining === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const employeeId = await generateEmployeeId();

    const newEmployee = await Employee.create({
      employeeId,
      name,
      role,
      contact: { email, phone },
      availability: {
        hoursPerWeek,
        shiftPreference,
        vacationDaysRemaining,
      },
      workHistory: [],
    });

    // Clerk Invitation using cURL
    const clerkSecretKey = process.env.CLERK_SECRET_KEY; // Store your Clerk secret key in an environment variable for security
    if (!clerkSecretKey) {
      return NextResponse.json({ error: "Clerk secret key is not configured" }, { status: 500 });
    }

    const clerkResponse = await fetch("https://api.clerk.com/v1/invitations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${clerkSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        public_metadata: { role }, // Add metadata for the invited user
        notify: true, // Send the invitation email
      }),
    });

    if (!clerkResponse.ok) {
      console.error("Error sending Clerk invitation:", await clerkResponse.text());
      return NextResponse.json({ error: "Failed to send Clerk invitation" }, { status: 500 });
    }

    return NextResponse.json(newEmployee);
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}
