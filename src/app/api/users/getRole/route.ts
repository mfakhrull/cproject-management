import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models";

export async function GET(req: NextRequest) {
  await dbConnect(); // Ensure database connection

  try {
    // Extract `userId` from query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid or missing userId parameter" },
        { status: 400 }
      );
    }

    // Find the user in your database using the Clerk ID
    const user = await User.findOne({ clerk_id: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return the user's role
    return NextResponse.json({ role: user.role }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const revalidate = 0;
