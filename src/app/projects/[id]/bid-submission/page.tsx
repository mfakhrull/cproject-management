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
          const data = await getDocumentById(documentId);
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

    toast.promise(submitBid(), {
      loading: "Submitting bid...",
      success: () => {
        router.push(`/projects/${projectIdToSubmit}/submitted-bids`);
        return "Bid submitted successfully!";
      },
      error: (err) => err.message || "An unexpected error occurred",
    });
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
    <div className="mx-auto max-w-[90%] p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bid Submission</h1>
      </div>

      <div className="space-y-12 rounded-lg bg-white p-8 shadow-md">
        {/* Opportunity Information */}
        <div className="border-b border-gray-900/10 pb-12">
          <div className="grid grid-cols-1 gap-14 sm:grid-cols-3">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Opportunity Information
              </h2>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-900">
                Title
              </label>{" "}
              <p className="text-gray-700">
                {opportunityData.title}
              </p>
            </div>
          </div>
        </div>

        {/* Bid Details Form */}
        <div className="border-b border-gray-900/10 pb-12">
          <div className="grid grid-cols-1 gap-14 sm:grid-cols-3">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Bid Details</h2>
              <p className="mt-1 text-sm text-gray-600">
                Provide the required details to submit your bid.
              </p>
            </div>
            <div className="space-y-4 sm:col-span-2">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Price
                </label>
                <input
                  type="number"
                  placeholder="Price"
                  value={bidDetails.price}
                  onChange={(e) =>
                    setBidDetails((prev) => ({
                      ...prev,
                      price: e.target.value,
                    }))
                  }
                  className="mt-2 block w-full rounded-md bg-white px-4 py-2 outline outline-1 outline-gray-300"
                />
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900">
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
                    className="mt-2 block w-full rounded-md bg-white px-4 py-2 outline outline-1 outline-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">
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
                    className="mt-2 block w-full rounded-md bg-white px-4 py-2 outline outline-1 outline-gray-300"
                  />
                </div>
              </div>

              {/* Timeline */}
              {timeline && (
                <p className="text-gray-700">
                  <strong>Timeline:</strong> {timeline}
                </p>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Notes (optional)
                </label>
                <textarea
                  placeholder="Notes (optional)"
                  value={bidDetails.notes}
                  onChange={(e) =>
                    setBidDetails((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  className="mt-2 block w-full rounded-md bg-white px-4 py-2 outline outline-1 outline-gray-300"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="border-b border-gray-900/10 pb-12">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Attachments</h2>
              <p className="mt-1 text-sm text-gray-600">
                Upload relevant files for your bid.
              </p>
            </div>
            <div className="space-y-4 sm:col-span-2">
              <div>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="block w-full rounded-md bg-white px-4 py-2 outline outline-1 outline-gray-300"
                />
              </div>
              {bidDetails.files.length > 0 && (
                <ul className="space-y-2">
                  {bidDetails.files.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between rounded bg-gray-50 p-3 shadow-sm"
                    >
                      <span className="text-gray-700">{file.name}</span>
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
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
          >
            Submit Bid
          </button>
        </div>
      </div>
    </div>
  );
}
