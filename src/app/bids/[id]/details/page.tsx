"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

export default function BidDetailsPage() {
  const { id } = useParams() as { id: string | string[] };
  const { userId } = useAuth();
  const router = useRouter();
  const [bid, setBid] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Ensure bidId is always a string
  const bidId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    if (!userId) {
      toast.error("You must be logged in to view this page");
      router.push("/sign-in");
      return;
    }

    if (!bidId) {
      toast.error("Bid ID is missing");
      router.push("/projects");
      return;
    }

    async function fetchBidDetails() {
      try {
        const response = await fetch(`/api/bids?bidId=${bidId}&userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch bid details");
        }
        const data = await response.json();
        setBid(data.bid);
      } catch (error) {
        console.error("Error fetching bid details:", error);
        toast.error("Failed to fetch bid details");
      } finally {
        setLoading(false);
      }
    }

    fetchBidDetails();
  }, [userId, bidId, router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!bid) {
    return <p>Bid not found</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bid Details</h1>
      <p>
        <strong>Contractor Name:</strong> {bid.contractorName || "Unknown"}
      </p>
      <p>
        <strong>Price:</strong> ${bid.price.toLocaleString()}
      </p>
      <p>
        <strong>Timeline:</strong> {bid.timeline || "Not provided"}
      </p>
      <p>
        <strong>Status:</strong> {bid.status || "Pending"}
      </p>
      <h2 className="text-xl font-bold mt-4">Attachments</h2>
      {bid.attachments?.length ? (
        <ul>
          {bid.attachments.map((attachment: any) => (
            <li key={attachment.fileUrl}>
              <a
                href={attachment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {attachment.fileName}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No attachments provided</p>
      )}
    </div>
  );
}
