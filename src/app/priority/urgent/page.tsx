"use client";

import React from "react";
import { useUser } from "@clerk/nextjs"; // Import the useUser hook
import ReusablePriorityPage from "../reusablePriorityPage";

const Urgent = () => {
 
  return <ReusablePriorityPage priority="URGENT" />;
};

export default Urgent;
