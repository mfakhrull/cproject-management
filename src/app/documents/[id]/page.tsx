'use client';

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { PlateReader } from "@/components/editor/plate-reader";
import { getDocumentById } from "@/app/action/documentActions";
import Link from "next/link";

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  const { userId } = useAuth();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      // Redirect to login if userId is not defined
      window.location.href = "/sign-in";
      return;
    }

    async function fetchDocument() {
      try {
        const doc = await getDocumentById(params.id, userId!); // Add non-null assertion `!`
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

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Document Title */}
      <h1 className="text-2xl font-bold">{document.title}</h1>

      {/* Associated Details */}
      <div className="p-4 bg-gray-100 rounded-md">
        {document.projectId?.name && (
          <p><strong>Project Name:</strong> {document.projectId.name}</p>
        )}
        {document.projectId?._id && (
          <p><strong>Project ID:</strong> {document.projectId._id}</p>
        )}
        <p><strong>Status:</strong> {document.status}</p>
        {document.deadline && (
          <p><strong>Deadline:</strong> {new Date(document.deadline).toLocaleDateString()}</p>
        )}
        <p><strong>Created At:</strong> {new Date(document.createdAt).toLocaleDateString()}</p>
        {document.assignedContractorId && (
          <p><strong>Assigned Contractor:</strong> {document.assignedContractorId}</p>
        )}
      </div>

      {/* Document Content */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Content</h2>
        <PlateReader initialContent={document.content} />
      </div>

      {/* Button to Bid Submission Page */}
      <div className="mt-4">
        <Link
          href={`/projects/${document.projectId?._id}/bid-submission?documentId=${document._id}`}
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Submit a Bid
        </Link>
      </div>
    </div>
  );
}
