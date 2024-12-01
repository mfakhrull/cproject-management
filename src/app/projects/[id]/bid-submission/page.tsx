"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDocumentById } from "@/app/action/documentActions";
import { saveBidSubmission } from "@/app/action/bidActions"; // Use the server action
import { toast } from "sonner";

export default function BidSubmissionPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [opportunityData, setOpportunityData] = useState<any>(null);
  const [bidDetails, setBidDetails] = useState({
    price: "",
    timeline: "",
    notes: "",
    files: [] as File[], // Initialize as an array of files
  });

  const documentId = searchParams.get("documentId");

  useEffect(() => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    if (!documentId) {
      toast.error("Document ID is missing");
      router.push("/documents");
      return;
    }

    async function fetchOpportunityData() {
      try {
        if (documentId) {
          const data = await getDocumentById(documentId, userId!);
          setOpportunityData(data);
        }
      } catch (error) {
        console.error("Error fetching opportunity data:", error);
        toast.error("Failed to fetch opportunity data");
      }
    }

    fetchOpportunityData();
  }, [userId, documentId, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      console.error("No files selected");
      return;
    }

    setBidDetails((prev) => ({
      ...prev,
      files: [...prev.files, ...Array.from(files)], // Append new files
    }));
  };

  const handleSubmit = async () => {
    if (!userId || !documentId) {
      toast.error('User authentication or opportunity data is missing');
      return;
    }
  
    try {
      const formData = new FormData();
  
      // Extract projectId as a string
      const projectIdToSubmit = opportunityData.projectId?._id 
        ? opportunityData.projectId._id.toString() // If projectId is an object
        : opportunityData.projectId?.toString();  // If projectId is already a string
  
      if (!projectIdToSubmit) {
        toast.error('Project ID is missing or invalid');
        return;
      }
  
      formData.append('projectId', projectIdToSubmit);
      formData.append('contractorId', userId); // Include userId as contractorId
      formData.append('price', bidDetails.price);
      formData.append('timeline', bidDetails.timeline);
      bidDetails.files.forEach((file) => formData.append('file', file));
  
      const response = await fetch('/api/bids', {
        method: 'POST',
        body: formData,
      });
  
      const result = await response.json();
  
      if (result.success) {
        toast.success('Bid submitted successfully!');
        router.push(`/projects/${projectIdToSubmit}/submitted-bids`);
      } else {
        toast.error(result.message || 'Failed to submit bid');
      }
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast.error('An unexpected error occurred');
    }
  };
  
  

  const handleRemoveFile = (index: number) => {
    setBidDetails((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  if (!opportunityData) {
    return <p>Loading opportunity data...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Submit Bid</h1>
      <p className="mb-4">Opportunity: {opportunityData.title}</p>
      <div className="space-y-4">
        <input
          type="number"
          placeholder="Price"
          value={bidDetails.price}
          onChange={(e) =>
            setBidDetails((prev) => ({ ...prev, price: e.target.value }))
          }
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="text"
          placeholder="Timeline"
          value={bidDetails.timeline}
          onChange={(e) =>
            setBidDetails((prev) => ({ ...prev, timeline: e.target.value }))
          }
          className="w-full px-4 py-2 border rounded"
        />
        <textarea
          placeholder="Notes (optional)"
          value={bidDetails.notes}
          onChange={(e) =>
            setBidDetails((prev) => ({ ...prev, notes: e.target.value }))
          }
          className="w-full px-4 py-2 border rounded"
        ></textarea>
        <div className="space-y-2">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full px-4 py-2"
          />
          {bidDetails.files.length > 0 && (
            <ul className="space-y-2">
              {bidDetails.files.map((file, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-100 p-2 rounded"
                >
                  <span>{file.name}</span>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Submit Bid
        </button>
      </div>
    </div>
  );
}
