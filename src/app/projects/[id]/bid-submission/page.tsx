"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDocumentById } from "@/app/action/documentActions";
import { toast } from "sonner";
import { Calendar } from "lucide-react";

export default function BidSubmissionPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [opportunityData, setOpportunityData] = useState<any>(null);
  const [bidDetails, setBidDetails] = useState({
    price: "",
    startDate: "",
    endDate: "",
    notes: "",
    files: [] as File[], // Initialize as an array of files
  });
  const [timeline, setTimeline] = useState<string>("");

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

  // Calculate timeline dynamically
  useEffect(() => {
    if (bidDetails.startDate && bidDetails.endDate) {
      const start = new Date(bidDetails.startDate);
      const end = new Date(bidDetails.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
      setTimeline(`${diffDays} days`);
    } else {
      setTimeline("");
    }
  }, [bidDetails.startDate, bidDetails.endDate]);

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
      toast.error("User authentication or opportunity data is missing");
      return;
    }
  
    const projectIdToSubmit = opportunityData.projectId?._id
      ? opportunityData.projectId._id.toString()
      : opportunityData.projectId?.toString();
  
    if (!projectIdToSubmit) {
      toast.error("Project ID is missing or invalid");
      return;
    }
  
    const formData = new FormData();
    formData.append("projectId", projectIdToSubmit);
    formData.append("documentId", documentId);
    formData.append("contractorId", userId);
    formData.append("price", bidDetails.price);
    formData.append("startDate", bidDetails.startDate); // Include startDate
    formData.append("endDate", bidDetails.endDate); // Include endDate
    formData.append("timeline", timeline); // Include the calculated timeline
    bidDetails.files.forEach((file) => formData.append("file", file));
  
    // Use toast.promise to handle loading, success, and error states
    const submitBid = async () => {
      const response = await fetch("/api/bids", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to submit bid");
      }
  
      const result = await response.json();
      if (result.success) {
        return result;
      } else {
        throw new Error(result.message || "Failed to submit bid");
      }
    };
  
    toast.promise(
      submitBid(),
      {
        loading: "Submitting bid...",
        success: () => {
          router.push(`/projects/${projectIdToSubmit}/submitted-bids`);
          return "Bid submitted successfully!";
        },
        error: (err) => err.message || "An unexpected error occurred",
      }
    );
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
    <div className="container mx-auto p-6">
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              value={bidDetails.startDate}
              onChange={(e) =>
                setBidDetails((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              value={bidDetails.endDate}
              onChange={(e) =>
                setBidDetails((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
              className="w-full px-4 py-2 border rounded"
            />
          </div>
        </div>
        {timeline && (
          <p className="text-gray-700">
            <strong>Timeline:</strong> {timeline}
          </p>
        )}
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
