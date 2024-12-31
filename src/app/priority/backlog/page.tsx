"use client";

import React from "react";
import { useUser } from "@clerk/nextjs"; // Import the useUser hook
import ReusablePriorityPage from "../reusablePriorityPage";

const Backlog = () => {
  
  return <ReusablePriorityPage priority="BACKLOG"/>;
};

export default Backlog;
