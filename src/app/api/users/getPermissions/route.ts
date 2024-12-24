// src/pages/api/users/getPermissions.ts

import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import {User} from "@/models"; // Import your User model

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    await dbConnect();

    const user = await User.findOne({ clerk_id: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ permissions: user.rolePermissions });
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
