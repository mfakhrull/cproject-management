"use client";

import React from "react";
import { useUser } from "@clerk/nextjs"; // Import the useUser hook
import ReusablePriorityPage from "../reusablePriorityPage";

const Backlog = () => {
  const { user } = useUser(); // Get the current logged-in user's data

  if (!user) {
    return <div>Loading user information...</div>; // Handle case where user data is not yet available
  }

  const userId = user.id; // Clerk provides the `id` for the logged-in user
  return <ReusablePriorityPage priority="BACKLOG" userId={userId} />;
};

export default Backlog;
