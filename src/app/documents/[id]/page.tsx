"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { PlateReader } from "@/components/editor/plate-reader";
import Link from "next/link";
import { Calendar, ClipboardCheck, FileText, Users } from "lucide-react";
import { useUserPermissions } from "@/context/UserPermissionsContext";
import FloatingTooltip from "@/components/FloatingTooltip";

export default function DocumentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = useAuth();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { permissions } = useUserPermissions();

  useEffect(() => {
    if (!userId) {
      // Redirect to login if userId is not defined
      window.location.href = "/sign-in";
      return;
    }

    async function fetchDocument() {
      try {
        const response = await fetch(`/api/documents/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch document");
        }

        const doc = await response.json();
        setDocument(doc);
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDocument();
  }, [userId, params.id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!document) {
    return <p>Document not found</p>;
  }

  const canSubmitBid =
    permissions.includes("can_submit_bid") ||
    permissions.includes("project_manager") ||
    permissions.includes("admin") ||
    permissions.includes("contractor") ||
    permissions.includes("supplier") ||
    permissions.includes("vendor");

  const canViewSubmittedBids =
    permissions.includes("can_view_submitted_bid") ||
    permissions.includes("project_manager") ||
    permissions.includes("admin") ||
    permissions.includes("contractor") ||
    permissions.includes("vendor") ||
    permissions.includes("supplier") ||
    permissions.includes("procurement_team");

  return (
    <div className="container mx-auto space-y-4 p-4">
      {/* Document Title */}
      <div className="relative flex flex-col rounded-lg bg-white p-6 shadow-md">
        {/* Details Section */}
        <div className="pb-8">
          <h1 className="text-2xl font-bold">{document.title}</h1>
        </div>
        <div className="mb-4 space-y-3">
          {document.projectId?.name && (
            <p className="flex items-center gap-3 text-gray-700">
              <FileText className="h-5 w-5 text-gray-500" />
              <span className="font-semibold">Project Name:</span>
              <span className="font-normal">{document.projectId.name}</span>
            </p>
          )}
          {document.projectId?._id && (
            <p className="flex items-center gap-3 text-gray-700">
              <FileText className="h-5 w-5 text-gray-500" />
              <span className="font-semibold">Project ID:</span>
              <span className="font-normal">{document.projectId._id}</span>
            </p>
          )}
          <p className="flex items-center gap-3 text-gray-700">
            <ClipboardCheck className="h-5 w-5 text-gray-500" />
            <span className="font-semibold">Status:</span>
            <span className="font-normal">{document.status}</span>
          </p>
          {document.deadline && (
            <p className="flex items-center gap-3 text-gray-700">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="font-semibold">Deadline:</span>
              <span className="font-normal">
                {new Date(document.deadline).toLocaleDateString()}
              </span>
            </p>
          )}
          <p className="flex items-center gap-3 text-gray-700">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="font-semibold">Created At:</span>
            <span className="font-normal">
              {new Date(document.createdAt).toLocaleDateString()}
            </span>
          </p>
          {document.assignedContractorId && (
            <p className="flex items-center gap-3 text-gray-700">
              <Users className="h-5 w-5 text-gray-500" />
              <span className="font-semibold">Assigned Contractor:</span>
              <span className="font-normal">
                {document.assignedContractorId}
              </span>
            </p>
          )}
        </div>

        {/* Buttons Section */}
        <div className="absolute bottom-6 right-6 flex space-x-4">
          {!canSubmitBid ? (
            <FloatingTooltip message="Permission Required">
              <button
                disabled
                className="inline-flex cursor-not-allowed items-center justify-center rounded bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-400"
              >
                Submit a Bid
              </button>
            </FloatingTooltip>
          ) : (
            <Link
              href={`/projects/${document.projectId?._id}/bid-submission?documentId=${document._id}`}
              className="inline-flex items-center justify-center rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Submit a Bid
            </Link>
          )}

          <Link
            href={`/projects/${document.projectId?._id}/submitted-bids`}
            className="inline-flex items-center justify-center rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            View Submitted Bids
          </Link>
        </div>
      </div>

      {/* Document Content */}
      <div>
        <h2 className="mb-2 text-xl font-semibold">Content</h2>
        <PlateReader initialContent={document.content} />
      </div>
    </div>
  );
}
