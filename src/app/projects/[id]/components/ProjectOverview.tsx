import { Calendar, ClipboardCheck, FileText, Users } from "lucide-react";

interface ProjectOverviewProps {
  project: {
    startDate: Date; // Accept Date instead of string
    endDate?: Date;  // Optional Date
    status: string;
    managerId: string;
    location: string;
  };
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project }) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Project Overview</h2>
      <p className="mb-2 flex items-center gap-2 text-gray-600">
        <Calendar className="h-5 w-5 text-blue-500" />
        Start Date: {project.startDate ? new Date(project.startDate).toLocaleDateString() : "N/A"}
      </p>
      <p className="mb-2 flex items-center gap-2 text-gray-600">
        <Calendar className="h-5 w-5 text-blue-500" />
        End Date: {project.endDate ? new Date(project.endDate).toLocaleDateString() : "N/A"}
      </p>
      <p className="mb-2 flex items-center gap-2 text-gray-600">
        <ClipboardCheck className="h-5 w-5 text-green-500" />
        Status: {project.status || "N/A"}
      </p>
      <p className="mb-2 flex items-center gap-2 text-gray-600">
        <Users className="h-5 w-5 text-purple-500" />
        Manager: {project.managerId || "Unassigned"}
      </p>
      <p className="mb-2 flex items-center gap-2 text-gray-600">
        <FileText className="h-5 w-5 text-orange-500" />
        Location: {project.location || "N/A"}
      </p>
    </div>
  );
};

export default ProjectOverview;
