"use client";

import React from "react";
import { useUser } from "@clerk/nextjs"; // Import the useUser hook
import ReusablePriorityPage from "../reusablePriorityPage";

const LOW = () => {
  
  return <ReusablePriorityPage priority="LOW" />;
};

export default LOW;
