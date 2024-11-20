// src/app/api/users/getUsers/route.ts
import { NextResponse } from "next/server";
import { User } from "../../../../models";
import dbConnect from "../../../../lib/mongodb";

export async function GET() {
  await dbConnect();

  try {
    // Fetch `clerk_id`, `username`, and `profilePictureUrl` from the User model
    const users = await User.find({}, { clerk_id: 1, username: 1, profilePictureUrl: 1 });
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching users:", error.message || error);
    return NextResponse.json(
      { message: `Error retrieving users: ${error.message || "Unknown error occurred"}` },
      { status: 500 }
    );
  }
}
