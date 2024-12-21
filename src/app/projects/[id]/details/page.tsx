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
import Link from "next/link";

import ProjectOverview from "../components/ProjectOverview";
import Attachments from "../components/Attachments";
import ApprovedBid from "../components/ApprovedBid"; // New component import
import MaterialRequests from "../components/MaterialRequests";
import TeamMembers from "../components/TeamMembers";
import AddTeamMemberModal from "../components/AddTeamMemberModal";
import { IEmployee } from "@/models/Employee";

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const { userId } = useAuth(); // Get Clerk userId
  const [project, setProject] = useState<IProject | null>(null);
  const [approvedBid, setApprovedBid] = useState<any | null>(null);
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
  const [isAddTeamMemberModalOpen, setIsAddTeamMemberModalOpen] =
    useState(false);

    // Function to refetch project details
  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`/api/projects/${id}/details`);
      if (!response.ok) throw new Error("Failed to fetch project details");
      const data: IProject = await response.json();
      setProject(data);
    } catch (err: any) {
      console.error("Error fetching project details:", err);
    }
  };

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

  // Fetch Approved Bid
  useEffect(() => {
    const fetchApprovedBid = async () => {
      try {
        const response = await fetch(`/api/projects/${id}/approved-bid`);
        if (!response.ok) throw new Error("Failed to fetch approved bid");
        const data = await response.json();
        setApprovedBid(data || null);
      } catch (err: any) {
        console.error(err.message);
      }
    };

    fetchApprovedBid();
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


//Fetch team members
  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`/api/projects/${id}/team`);
      if (!response.ok) throw new Error("Failed to fetch team members");
      const employees: IEmployee[] = await response.json();
      setProject((prevProject) =>
        prevProject ? { ...prevProject, teamMembers: employees } : null,
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch team members.");
    }
  };

  useEffect(() => {
    fetchTeamMembers();
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
          items: request.items,
          notes: request.notes,
          requestedBy: userId,
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

  const handleFileUpload = async (file: File) => {
    if (!file || !userId) {
      toast.error("Please select a file and ensure you're logged in");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadedBy", userId);

      const response = await fetch(`/api/projects/${id}/attachments`, {
        method: "POST",
        body: formData,
      });

      const updatedProject = await response.json();
      setProject(updatedProject);
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddTeamMember = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/projects/${id}/team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      });
      if (!response.ok) throw new Error("Failed to add team member");

      const updatedTeamMembers: IEmployee[] = await response.json();
      setProject((prevProject) =>
        prevProject
          ? { ...prevProject, teamMembers: updatedTeamMembers }
          : null,
      );
      toast.success("Team member added successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add team member.");
    }
  };

  const handleDeleteTeamMember = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/projects/${id}/team`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      });
      if (!response.ok) throw new Error("Failed to delete team member");

      const updatedTeamMembers: IEmployee[] = await response.json();
      setProject((prevProject) =>
        prevProject
          ? { ...prevProject, teamMembers: updatedTeamMembers }
          : null,
      );
      toast.success("Team member deleted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete team member.");
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      const response = await fetch(`/api/projects/${id}/attachments`, {
        method: "PUT", // Assuming you're using PUT for updating the project by removing an attachment
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ attachmentId }),
      });

      if (!response.ok) throw new Error("Failed to delete attachment");

      // Update the local project state
      setProject((prevProject) => {
        if (!prevProject) return null;
        return {
          ...prevProject,
          attachments: prevProject.attachments.filter(
            (attachment) => attachment._id !== attachmentId,
          ),
        };
      });

      toast.success("Attachment deleted successfully!");
    } catch (error) {
      console.error("Error deleting attachment:", error);
      toast.error("Failed to delete attachment.");
    }
  };

  if (!userId) return <div>Please log in to view this page.</div>;
  if (isLoading)
    return <div className="p-6 text-center">Loading project details...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            {project?.name || "Project Name"}
          </h1>
          <p className="text-gray-600">
            {project?.description || "No description provided."}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            href={`/editor?projectId=${id}&projectName=${encodeURIComponent(project?.name || "")}`}
            className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            Create Opportunity for this Project
          </Link>
          <Link
            href={`/projects/${id}/submitted-bids`}
            className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            View Submitted Bids
          </Link>
        </div>
      </div>

      {/* Project Details */}
      <div className="mb-8 grid min-h-[250px] grid-cols-1 gap-6 md:grid-cols-2">
        {/* Use ProjectOverview component */}
        {project && (
          <ProjectOverview
            project={project}
            onUpdate={(updatedProject) => {
              // Option 1: Preserve existing team members
              setProject((prevProject) => ({
                ...prevProject,
                ...updatedProject,
                teamMembers: prevProject?.teamMembers ?? [], // Keep teamMembers intact
              }));

              // Option 2: Re-fetch team members
              fetchTeamMembers();
            }}
          />
        )}

        {/* Team Members */}
        <TeamMembers
          teamMembers={project?.teamMembers || []} // Use an empty array as fallback
          onAddTeamMember={() => setIsAddTeamMemberModalOpen(true)}
          onDeleteTeamMember={handleDeleteTeamMember}
        />

        <AddTeamMemberModal
          isOpen={isAddTeamMemberModalOpen}
          onClose={() => setIsAddTeamMemberModalOpen(false)}
          onAddMember={handleAddTeamMember}
        />
      </div>

      {project && typeof id === "string" && (
        <Attachments
          projectId={id} // Pass the project ID
          attachments={project.attachments}
          onFileUpload={handleFileUpload}
          isUploading={isUploading}
          onDeleteAttachment={handleDeleteAttachment} // Pass the delete handler
        />
      )}

      {/* Approved Bid Section */}
      <ApprovedBid approvedBid={approvedBid} />

      <MaterialRequests
        materialRequests={materialRequests}
        onOpenDetailsModal={openDetailsModal}
        onOpenRequestModal={() => setIsModalOpen(true)}
      />

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
