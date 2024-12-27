"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updateBidStatus } from "@/app/action/bidActions";
import { useUserPermissions } from "@/context/UserPermissionsContext";
import FloatingTooltip from "@/components/FloatingTooltip";

// Define the bid structure
interface Bid {
  _id: string;
  projectId: string;
  projectName: string;
  contractorId: string;
  contractorName: string;
  price: number;
  timeline: string;
  startDate: string;
  endDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  attachments: { fileName: string; fileUrl: string }[];
  documentId: string;
}

export default function BidDetailsPage() {
  const { bidId } = useParams();
  const router = useRouter();
  const [bid, setBid] = useState<Bid | null>(null); // Use the Bid type
  const [loading, setLoading] = useState(true);
  const { permissions, loading: permissionsLoading } = useUserPermissions();

  useEffect(() => {
    async function fetchBidDetails() {
      try {
        const response = await fetch(`/api/bids/${bidId}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch bid details");
        }

        setBid(result.bid);
      } catch (error) {
        console.error("Error fetching bid details:", error);
        toast.error("Failed to fetch bid details");
        router.back();
      } finally {
        setLoading(false);
      }
    }

    fetchBidDetails();
  }, [bidId, router]);

  const handleUpdateStatus = (status: "APPROVED" | "REJECTED" | "PENDING") => {
    if (!bid) {
      toast.error("Bid data is not loaded.");
      return;
    }

    const confirmMessage =
      status === "APPROVED"
        ? "Are you sure you want to approve this bid?"
        : status === "REJECTED"
          ? "Are you sure you want to reject this bid?"
          : "Are you sure you want to revert this bid to pending status?";

    toast(confirmMessage, {
      action: {
        label: "Confirm",
        onClick: async () => {
          try {
            const result = await updateBidStatus(
              bid._id,
              status,
              bid.documentId,
            );

            if (!result.success) {
              throw new Error(result.message || "Failed to update status");
            }

            toast.success(`Bid status updated to ${status}`);
            setBid((prevBid) => (prevBid ? { ...prevBid, status } : null));
          } catch (error) {
            console.error("Error updating bid status:", error);
            toast.error(
              error instanceof Error ? error.message : "Error updating status",
            );
          }
        },
      },
    });
  };

  if (permissionsLoading) {
    return <p className="mt-4 text-center">Checking permissions...</p>;
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!bid) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">Bid not found</p>
      </div>
    );
  }

  const canApproveOrRejectBids =
    permissions.includes("admin") ||
    permissions.includes("project_manager") ||
    permissions.includes("procurement_team") ||
    permissions.includes("can_approve_bid") ||
    permissions.includes("can_reject_bid");

  return (
    <div className="mx-auto max-w-[90%] p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bid Details</h1>
      </div>

      <div className="space-y-12 rounded-lg bg-white p-8 shadow-md">
        {/* Bid Information */}
        <div className="border-b border-gray-900/10 pb-12">
          <div className="grid grid-cols-1 gap-14 sm:grid-cols-3">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Bid Information
              </h2>
            </div>
            <div className="space-y-4 sm:col-span-2">
              {[
                { label: "Project ID", value: bid.projectId },
                { label: "Project Name", value: bid.projectName },
                { label: "Contractor ID", value: bid.contractorId },
                { label: "Contractor Name", value: bid.contractorName },
                { label: "Price", value: `$${bid.price}` },
                { label: "Timeline", value: bid.timeline },
                {
                  label: "Start Date",
                  value: new Date(bid.startDate).toLocaleDateString(),
                },
                {
                  label: "End Date",
                  value: new Date(bid.endDate).toLocaleDateString(),
                },
                {
                  label: "Status",
                  value: (
                    <span
                      className={`rounded px-2 py-1 ${
                        bid.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : bid.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {bid.status}
                    </span>
                  ),
                },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <p className="w-32 font-semibold text-gray-700">
                    {item.label}:
                  </p>
                  <p className="flex-1 text-gray-700">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attachments */}
        <div className="border-b border-gray-900/10 pb-12">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Attachments</h2>
              <p className="mt-1 text-sm text-gray-600">
                Files attached to the bid.
              </p>
            </div>
            <div className="space-y-4 sm:col-span-2">
              {bid.attachments.length > 0 ? (
                <ul className="space-y-2">
                  {bid.attachments.map((attachment, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between rounded bg-gray-50 p-3 shadow-sm"
                    >
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
                <p className="text-gray-500">No attachments available.</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {!canApproveOrRejectBids ? (
            <>
              <FloatingTooltip message="Permission Required">
                <button
                  disabled
                  className="cursor-not-allowed rounded bg-gray-200 px-6 py-2 text-gray-400"
                >
                  {bid.status === "APPROVED" ? "Pending" : "Approve"}
                </button>
              </FloatingTooltip>
              <FloatingTooltip message="Permission Required">
                <button
                  disabled
                  className="cursor-not-allowed rounded bg-gray-200 px-6 py-2 text-gray-400"
                >
                  Reject
                </button>
              </FloatingTooltip>
            </>
          ) : (
            <>
              <button
                onClick={() =>
                  handleUpdateStatus(
                    bid.status === "APPROVED" ? "PENDING" : "APPROVED",
                  )
                }
                className={`rounded-lg px-4 py-3 text-white mb-2 me-2 ${
                  bid.status === "APPROVED"
                    ? "bg-yellow-400 hover:bg-yellow-500"
                    : "bg-green-400 hover:bg-green-500"
                }`}
              >
                {bid.status === "APPROVED" ? "Pending" : "Approve"}
              </button>
              <button
                onClick={() => handleUpdateStatus("REJECTED")}
                className="mb-2 me-2 rounded-lg bg-red-400 px-6 py-2 text-white hover:bg-red-600"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
