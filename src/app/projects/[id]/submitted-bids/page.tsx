"use client";

import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getSubmittedBids, updateBidStatus } from "@/app/action/bidActions";

export default function SubmittedBidsPage() {
  const { id } = useParams(); // id corresponds to projectId
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useAuth();
  const projectId = Array.isArray(id) ? id[0] : id; // Ensure projectId is a string

  useEffect(() => {
    if (!projectId) {
      toast.error("Project ID is missing");
      window.location.href = "/projects";
      return;
    }

    async function fetchBids() {
      try {
        const response = await getSubmittedBids(projectId, userId!);
        setBids(response);
      } catch (error) {
        console.error("Error fetching submitted bids:", error);
        toast.error("Failed to fetch submitted bids");
      } finally {
        setLoading(false);
      }
    }

    fetchBids();
  }, [projectId, userId]);

  async function handleUpdateStatus(bidId: string, status: "APPROVED" | "REJECTED") {
    try {
      const result = await updateBidStatus(bidId, status);
  
      if (!result.success) {
        throw new Error(result.message || "Failed to update status");
      }
  
      toast.success(`Bid status updated to ${status}`);
      setBids((prevBids) =>
        prevBids.map((bid) =>
          bid._id === bidId ? { ...bid, status } : bid
        )
      );
    } catch (error) {
      console.error("Error updating bid status:", error);
      toast.error(error instanceof Error ? error.message : "Error updating status");
    }
  }
  

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
  <h1 className="text-2xl font-bold mb-4">Submitted Bids</h1>
  {bids.length === 0 ? (
    <p>No bids submitted for this project.</p>
  ) : (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr>
          <th className="border border-gray-300 p-2">Contractor</th>
          <th className="border border-gray-300 p-2">Price</th>
          <th className="border border-gray-300 p-2">Timeline</th>
          <th className="border border-gray-300 p-2">Status</th>
          <th className="border border-gray-300 p-2">Attachments</th>
          <th className="border border-gray-300 p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {bids.map((bid) => (
          <tr key={bid._id}>
            <td className="border border-gray-300 p-2">{bid.contractorName}</td>
            <td className="border border-gray-300 p-2">${bid.price.toLocaleString()}</td>
            <td className="border border-gray-300 p-2">{bid.timeline}</td>
            <td className="border border-gray-300 p-2 capitalize">{bid.status.toLowerCase()}</td>
            <td className="border border-gray-300 p-2">
              {bid.attachments.map((attachment: any, index: number) => (
                <div key={index}>
                  <a
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {attachment.fileName}
                  </a>
                </div>
              ))}
            </td>
            <td className="border border-gray-300 p-2">
              <button
                onClick={() => handleUpdateStatus(bid._id, "APPROVED")}
                className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
              >
                Approve
              </button>
              <button
                onClick={() => handleUpdateStatus(bid._id, "REJECTED")}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 ml-2"
              >
                Reject
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>
  );
}
