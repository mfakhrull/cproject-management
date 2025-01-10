import React, { useState } from "react";
import { Calendar, ClipboardCheck, FileText, Users, Edit2 } from "lucide-react";
import UpdateProjectModal from "./UpdateProjectModal";
import { IProject } from "@/types";
import { useAppDispatch } from "@/app/redux/redux";
import { triggerProjectRefresh } from "@/app/state";
import FloatingTooltip from "@/components/FloatingTooltip";

interface ProjectOverviewProps {
  project: {
    _id: string;
    name: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    extendedDate?: Date;
    status: "PLANNING" | "IN_PROGRESS" | "COMPLETED";
    location: string;
    manager?: {
      name: string;
      employeeId: string;
      role: string;
    };
  };
  onUpdate: (updatedProject: IProject) => void; // Add this prop
  isButtonDisabled?: boolean; // Add this prop
}

// Helper function to get the appropriate classes for each status
const getStatusBadgeClasses = (
  status: "PLANNING" | "IN_PROGRESS" | "COMPLETED",
) => {
  switch (status) {
    case "PLANNING":
      return "bg-blue-100 text-blue-800";
    case "IN_PROGRESS":
      return "bg-yellow-100 text-yellow-800";
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  project,
  onUpdate,
  isButtonDisabled = false, // Default to false if not provided
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const dispatch = useAppDispatch();

  const handleUpdate = (updatedProject: IProject) => {
    setIsModalOpen(false);
    onUpdate(updatedProject);
    if (project.status !== updatedProject.status) {
      dispatch(triggerProjectRefresh()); // Trigger sidebar project refresh
    }
  };

  return (
    <div className="relative rounded-lg bg-white p-6 shadow-md">
      {/* Update Project Modal */}
      <UpdateProjectModal
        project={project}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleUpdate}
      />

      {/* Edit Button with Tooltip */}
      <div className="absolute right-4 top-4">
        <FloatingTooltip message="Permission Required">
          <button
            onClick={() => {
              if (!isButtonDisabled) {
                setIsModalOpen(true);
              }
            }}
            className={`p-2 ${
              isButtonDisabled
                ? "cursor-not-allowed text-gray-300"
                : "text-gray-500 hover:text-black"
            }`}
            aria-label="Edit Project"
            disabled={isButtonDisabled}
          >
            <Edit2 className="h-5 w-5" />
          </button>
        </FloatingTooltip>
      </div>

      <h2 className="mb-6 text-xl font-semibold text-gray-800">
        Project Overview
      </h2>

      <div className="space-y-4">
        <p className="flex items-center gap-3 text-gray-700">
          <Calendar className="h-6 w-6 text-black" />
          <span className="font-semibold">Start Date:</span>
          <span className="font-normal">
            {project.startDate
              ? new Date(project.startDate).toLocaleDateString()
              : "N/A"}
          </span>
        </p>

        <p className="flex items-center gap-3 text-gray-700">
          <Calendar className="h-6 w-6 text-black" />
          <span className="font-semibold">End Date:</span>
          <span className="font-normal">
            {project.endDate
              ? new Date(project.endDate).toLocaleDateString()
              : "N/A"}
          </span>
        </p>

        <p className="flex items-center gap-3 text-gray-700">
          <Calendar className="h-6 w-6 text-black" />
          <span className="font-semibold">Extended Date:</span>
          <span className="font-normal">
            {project.extendedDate
              ? new Date(project.extendedDate).toLocaleDateString()
              : "N/A"}
          </span>
        </p>

        <p className="flex items-center gap-3 text-gray-700">
          <ClipboardCheck className="h-6 w-6 text-black" />
          <span className="font-semibold">Status:</span>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 ${getStatusBadgeClasses(project.status)}`}
          >
            {project.status || "N/A"}
          </span>
        </p>

        <p className="flex items-center gap-3 text-gray-700">
          <Users className="h-6 w-6 text-black" />
          <span className="font-semibold">Manager:</span>
          <span className="font-normal">
            {project.manager
              ? `${project.manager.name} (${project.manager.role})`
              : "Unassigned"}
          </span>
        </p>

        <p className="flex items-center gap-3 text-gray-700">
          <FileText className="h-6 w-6 text-black" />
          <span className="font-semibold">Location:</span>
          <span className="font-normal">{project.location || "N/A"}</span>
        </p>
      </div>
    </div>
  );
};

export default ProjectOverview;
