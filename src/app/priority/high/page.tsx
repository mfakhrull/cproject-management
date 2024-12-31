"use client";

import React from "react";
import { useUser } from "@clerk/nextjs"; // Import the useUser hook
import ReusablePriorityPage from "../reusablePriorityPage";

const High = () => {
  

  return <ReusablePriorityPage priority="HIGH"/>;
};

export default High;
