// src/app/api/users/getUser/route.ts
import { NextResponse } from "next/server";
import { User } from "../../../../models";
import dbConnect from "../../../../lib/mongodb";

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const clerk_id = searchParams.get("clerk_id"); // Retrieve `clerk_id` from query parameters

  if (!clerk_id) {
    return NextResponse.json({ message: "clerk_id parameter is required" }, { status: 400 });
  }

  try {
    const user = await User.findOne({ clerk_id });
    if (user) {
      return NextResponse.json(user, { status: 200 });
    } else {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error retrieving user: ${error.message || "Unknown error occurred"}` },
      { status: 500 }
    );
  }
}

export const revalidate = 0;
