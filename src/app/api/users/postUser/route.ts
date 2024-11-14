// src/app/api/users/postUser/route.ts
import { NextResponse } from "next/server";
import { User } from "../../../../models";
import dbConnect from "../../../../lib/mongodb";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { username, clerk_id, profilePictureUrl = "i1.jpg", teamId } = await req.json();

    const newUser = await User.create({
      username,
      clerk_id,
      profilePictureUrl,
      teamId,
    });

    return NextResponse.json(
      { message: "User Created Successfully", newUser },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error creating user: ${error.message || "Unknown error occurred"}` },
      { status: 500 }
    );
  }
}
