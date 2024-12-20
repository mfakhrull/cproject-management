import { Calendar, ClipboardCheck, FileText, Users } from "lucide-react";

interface ProjectOverviewProps {
  project: {
    startDate: Date;
    endDate?: Date;
    status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED';
    location: string;
    manager?: {
      name: string;
      employeeId: string;
      role: string;
    };
  };
}

// Helper function to get the appropriate classes for each status
const getStatusBadgeClasses = (status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED') => {
  switch (status) {
    case 'PLANNING':
      return 'bg-blue-100 text-blue-800';
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project }) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-xl font-semibold text-gray-800">Project Overview</h2>

      <div className="mb-4">
        <p className="mb-3 flex items-center gap-3 text-gray-700">
          <Calendar className="h-6 w-6 text-black" />
          <span className="font-semibold">Start Date:</span> 
          <span className="font-normal">{project.startDate ? new Date(project.startDate).toLocaleDateString() : "N/A"}</span>
        </p>

        <p className="mb-3 flex items-center gap-3 text-gray-700">
          <Calendar className="h-6 w-6 text-black" />
          <span className="font-semibold">End Date:</span> 
          <span className="font-normal">{project.endDate ? new Date(project.endDate).toLocaleDateString() : "N/A"}</span>
        </p>

        <p className="mb-3 flex items-center gap-3 text-gray-700">
          <ClipboardCheck className="h-6 w-6 text-black" />
          <span className="font-semibold">Status:</span> 
          <span 
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold leading-5 ${getStatusBadgeClasses(project.status)}`}
          >
            {project.status || "N/A"}
          </span>
        </p>

        <p className="mb-3 flex items-center gap-3 text-gray-700">
          <Users className="h-6 w-6 text-black" />
          <span className="font-semibold">Manager:</span> 
          <span className="font-normal">{project.manager ? `${project.manager.name} (${project.manager.role})` : "Unassigned"}</span>
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
