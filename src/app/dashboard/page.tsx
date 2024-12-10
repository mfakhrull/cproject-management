"use client";

import UserContracts from "@/components/dashboard/UserContracts";

export default function Dashboard() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Your Contracts Dashboard</h1>
      <UserContracts />
    </div>
  );
}
