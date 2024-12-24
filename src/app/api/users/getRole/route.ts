// src/pages/api/users/getRole.ts

import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import {User} from "@/models"; // Import your User model

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect(); // Connect to the database

  const { userId } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "Invalid or missing userId parameter" });
  }

  try {
    const user = await User.findOne({ clerk_id: userId }); // Adjust based on your schema

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ role: user.role }); // Assuming "role" is a field in your User model
  } catch (error) {
    console.error("Error fetching user role:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
