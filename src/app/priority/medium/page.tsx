"use client";

import React from "react";
import { useUser } from "@clerk/nextjs"; // Import the useUser hook
import ReusablePriorityPage from "../reusablePriorityPage";

const Medium = () => {

  return <ReusablePriorityPage priority="MEDIUM"/>;
};

export default Medium;
