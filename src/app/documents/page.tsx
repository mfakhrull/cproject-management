"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getOpenOpportunities } from "@/app/action/documentActions";

export default function DocumentsPage() {
  const { userId } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      // Redirect to login if userId is null or undefined
      window.location.href = "/sign-in";
      return;
    }

    async function fetchOpportunities() {
      try {
        const docs = await getOpenOpportunities(userId!); // Add non-null assertion `!`
        setOpportunities(docs);
      } catch (error) {
        console.error("Error fetching opportunities:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOpportunities();
  }, [userId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Open Bid Opportunities</h1>
      {opportunities.length === 0 ? (
        <p>No open opportunities found</p>
      ) : (
        <div className="grid gap-4">
          {opportunities.map((opportunity) => (
            <Link
              key={opportunity._id}
              href={`/documents/${opportunity._id}`}
              className="block p-4 border rounded hover:bg-gray-100 transition"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{opportunity.title}</h2>
                <div className="flex flex-col text-gray-500">
                  <span>Project: {opportunity.projectId?.name || "N/A"}</span>
                  <span>Status: {opportunity.status}</span>
                  <span>Deadline: {new Date(opportunity.deadline).toLocaleDateString()}</span>
                  <span>Created: {new Date(opportunity.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
