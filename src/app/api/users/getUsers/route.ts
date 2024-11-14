// src/app/api/users/getUsers/route.ts
import { NextResponse } from "next/server";
import { User } from "../../../../models";
import dbConnect from "../../../../lib/mongodb";

export async function GET() {
  await dbConnect();

  try {
    const users = await User.find();
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error retrieving users: ${error.message || "Unknown error occurred"}` },
      { status: 500 }
    );
  }
}
