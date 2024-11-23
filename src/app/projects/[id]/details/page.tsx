"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Download,
  FileText,
  PlusCircle,
  Users,
  Calendar,
  ClipboardCheck,
} from "lucide-react";
import { toast } from "sonner";
import RequestMaterialModal from "@/components/RequestMaterialModal";
import RequestMaterialDetailsModal from "@/components/RequestMaterialDetailsModal";
import { IProject, IMaterialRequest } from "@/types";
import { useAuth } from "@clerk/nextjs"; // Import Clerk hook

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const { userId } = useAuth(); // Get Clerk userId
  const [project, setProject] = useState<IProject | null>(null);
  const [materialRequests, setMaterialRequests] = useState<IMaterialRequest[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaterialRequest, setSelectedMaterialRequest] =
    useState<IMaterialRequest | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch Project Details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/projects/${id}/details`);
        if (!response.ok) throw new Error("Failed to fetch project details");
        const data: IProject = await response.json();
        setProject(data);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  // Fetch Material Requests
  useEffect(() => {
    const fetchMaterialRequests = async () => {
      try {
        const response = await fetch(`/api/projects/${id}/materials`);
        if (!response.ok) throw new Error("Failed to fetch material requests");
        const data: IMaterialRequest[] = await response.json();
        setMaterialRequests(data);
      } catch (err: any) {
        console.error(err.message);
      }
    };

    fetchMaterialRequests();
  }, [id]);

  const handleRequestMaterial = async (request: {
    items: {
      name: string;
      quantity: number;
      priority: "LOW" | "MEDIUM" | "HIGH";
    }[];
    notes: string;
  }) => {
    if (!userId) {
      toast.error("You must be logged in to make a material request.");
      return;
    }

    try {
      const response = await fetch(`/api/projects/${id}/materials/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: request.items, // Pass the array of items
          notes: request.notes,
          requestedBy: userId, // Pass Clerk's userId
        }),
      });

      if (!response.ok) throw new Error("Failed to submit material request");

      const newRequest: IMaterialRequest = await response.json();
      setMaterialRequests((prevRequests) => [...prevRequests, newRequest]);
      toast.success("Material request submitted successfully!");
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Error submitting material request.");
    }
  };

  const openDetailsModal = (request: IMaterialRequest) => {
    setSelectedMaterialRequest(request);
    setIsDetailsModalOpen(true);
  };

  const updateMaterialRequest = async (updatedRequest: IMaterialRequest) => {
    try {
      const response = await fetch(
        `/api/material-requests/${updatedRequest._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedRequest),
        },
      );
      if (!response.ok) throw new Error("Failed to update material request");

      const updatedData: IMaterialRequest = await response.json();
      setMaterialRequests((prevRequests) =>
        prevRequests.map((req) =>
          req._id === updatedData._id ? updatedData : req,
        ),
      );
      toast.success("Material request updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Error updating material request.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file || !userId) {
      toast.error("Please select a file and ensure you're logged in");
      return;
    }

    setIsUploading(true);
    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadedBy", userId);

      // Upload with timeout
      const response = await fetch(`/api/projects/${id}/attachments`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      const updatedProject = await response.json();
      setProject(updatedProject);
      setFile(null);
      toast.success("File uploaded successfully!");

      // Clear the file input
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(error.message || "Error uploading file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadAttachment = (url: string) => {
    window.open(url, "_blank");
    toast.success("Attachment downloading...");
  };

  if (!userId) return <div>Please log in to view this page.</div>;
  if (isLoading)
    return <div className="p-6 text-center">Loading project details...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-800">
          {project?.name || "Project Name"}
        </h1>
        <p className="text-gray-600">
          {project?.description || "No description provided."}
        </p>
      </div>

      {/* Project Details */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Project Overview
          </h2>
          <p className="mb-2 flex items-center gap-2 text-gray-600">
            <Calendar className="h-5 w-5 text-blue-500" />
            Start Date:{" "}
            {project?.startDate
              ? new Date(project.startDate).toLocaleDateString()
              : "N/A"}
          </p>
          <p className="mb-2 flex items-center gap-2 text-gray-600">
            <Calendar className="h-5 w-5 text-blue-500" />
            End Date:{" "}
            {project?.endDate
              ? new Date(project.endDate).toLocaleDateString()
              : "N/A"}
          </p>
          <p className="mb-2 flex items-center gap-2 text-gray-600">
            <ClipboardCheck className="h-5 w-5 text-green-500" />
            Status: {project?.status || "N/A"}
          </p>
          <p className="mb-2 flex items-center gap-2 text-gray-600">
            <Users className="h-5 w-5 text-purple-500" />
            Manager: {project?.managerId || "Unassigned"}
          </p>
          <p className="mb-2 flex items-center gap-2 text-gray-600">
            <FileText className="h-5 w-5 text-orange-500" />
            Location: {project?.location || "N/A"}
          </p>
        </div>

        {/* Team Members */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Team Members
          </h2>
          {project?.teamMembers.length ? (
            <ul className="list-disc pl-5 text-gray-700">
              {project?.teamMembers.map((member, index) => (
                <li key={index}>{member}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No team members assigned.</p>
          )}
        </div>
      </div>

      <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Attachments
        </h2>
        {project?.attachments?.length ? (
          <ul className="space-y-2">
            {project.attachments.map((attachment, index) => (
              <li
                key={index}
                className="flex items-center justify-between rounded-md bg-gray-100 px-4 py-2 hover:bg-gray-200"
              >
                <span>{attachment.fileName}</span>
                <button
                  onClick={() => handleDownloadAttachment(attachment.fileUrl)}
                  className="text-blue-500 hover:underline"
                >
                  <Download className="mr-1 inline-block h-5 w-5" />
                  Download
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No attachments available.</p>
        )}
        <div className="mt-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full rounded-md border p-2"
            disabled={isUploading}
          />
          <button
            onClick={handleFileUpload}
            disabled={!file || isUploading}
            className={`mt-2 rounded px-4 py-2 text-white ${
              !file || isUploading
                ? "cursor-not-allowed bg-gray-400"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isUploading ? (
              <span className="flex items-center">
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Uploading...
              </span>
            ) : (
              "Upload Attachment"
            )}
          </button>
        </div>
      </div>

      {/* Material Requests */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Material Requests
        </h2>
        {materialRequests.length ? (
          <ul className="space-y-2">
            {materialRequests.map((request) => (
              <li
                key={request._id}
                className="flex cursor-pointer items-center justify-between rounded-md bg-gray-100 px-4 py-2 hover:bg-gray-200"
                onClick={() => openDetailsModal(request)}
              >
                <span>Request ID: {request._id}</span>
                <span
                  className={`capitalize ${
                    request.status === "APPROVED"
                      ? "text-green-500"
                      : request.status === "PENDING"
                        ? "text-yellow-500"
                        : "text-red-500"
                  }`}
                >
                  {request.status.toLowerCase()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No material requests submitted.</p>
        )}
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 flex items-center rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          <PlusCircle className="mr-2" />
          Request Material
        </button>
      </div>

      {/* Request Material Modal */}
      <RequestMaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleRequestMaterial}
      />
      <RequestMaterialDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        materialRequest={selectedMaterialRequest}
        onUpdate={updateMaterialRequest}
      />
    </div>
  );
};

export default ProjectDetailsPage;
