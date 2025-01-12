import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  await dbConnect(); // Ensure database connection

  try {
    // Get authenticated user ID from Clerk
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Find the user in your database using the Clerk ID
    const user = await User.findOne({ clerk_id: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return permissions, employeeId, username, and role
    return NextResponse.json({
      permissions: user.rolePermissions,
      employeeId: user.employeeId,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const revalidate = 0;
