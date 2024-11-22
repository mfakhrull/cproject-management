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
import { IProject, IMaterialRequest } from "@/types";
import { useAuth } from "@clerk/nextjs"; // Import Clerk hook

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const { userId } = useAuth(); // Get Clerk userId
  const [project, setProject] = useState<IProject | null>(null);
  const [materialRequests, setMaterialRequests] = useState<IMaterialRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    items: { name: string; quantity: number; priority: "LOW" | "MEDIUM" | "HIGH" }[];
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
  

  const handleDownloadAttachment = (url: string) => {
    window.open(url, "_blank");
    toast.success("Attachment downloading...");
  };

  if (!userId) return <div>Please log in to view this page.</div>;
  if (isLoading) return <div className="text-center p-6">Loading project details...</div>;
  if (error) return <div className="text-center text-red-500 p-6">{error}</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{project?.name || "Project Name"}</h1>
        <p className="text-gray-600">{project?.description || "No description provided."}</p>
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Project Overview</h2>
          <p className="flex items-center gap-2 text-gray-600 mb-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Start Date: {project?.startDate ? new Date(project.startDate).toLocaleDateString() : "N/A"}
          </p>
          <p className="flex items-center gap-2 text-gray-600 mb-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            End Date: {project?.endDate ? new Date(project.endDate).toLocaleDateString() : "N/A"}
          </p>
          <p className="flex items-center gap-2 text-gray-600 mb-2">
            <ClipboardCheck className="h-5 w-5 text-green-500" />
            Status: {project?.status || "N/A"}
          </p>
          <p className="flex items-center gap-2 text-gray-600 mb-2">
            <Users className="h-5 w-5 text-purple-500" />
            Manager: {project?.managerId || "Unassigned"}
          </p>
          <p className="flex items-center gap-2 text-gray-600 mb-2">
            <FileText className="h-5 w-5 text-orange-500" />
            Location: {project?.location || "N/A"}
          </p>
        </div>

        {/* Team Members */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Team Members</h2>
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

      {/* Attachments */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Attachments</h2>
        {project?.attachments.length ? (
          <ul className="space-y-2">
            {project.attachments.map((attachment, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200"
              >
                <span>{attachment.fileName}</span>
                <button
                  onClick={() => handleDownloadAttachment(attachment.fileUrl)}
                  className="text-blue-500 hover:underline"
                >
                  <Download className="h-5 w-5 inline-block mr-1" />
                  Download
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No attachments available.</p>
        )}
      </div>

      {/* Material Requests */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Material Requests</h2>
        {materialRequests.length ? (
          <ul className="space-y-2">
            {materialRequests.map((request) => (
              <li
                key={request._id}
                className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200"
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
          className="mt-4 flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
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
    </div>
  );
};

export default ProjectDetailsPage;
