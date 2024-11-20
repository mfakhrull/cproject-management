// src/app/projects/tasks/TaskDetails.tsx

import React from "react";
import { User } from "lucide-react";

interface TaskDetailsProps {
  task: {
    title: string;
    description: string;
    status: string;
    priority: string;
    startDate: string;
    dueDate: string;
    assignee: string;
    createdBy: string;
  };
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ task }) => {
  return (
    <div>
      {/* Title and Description */}
      <h1 className="text-3xl font-bold mb-4">{task.title}</h1>
      <p className="text-gray-600 mb-6">{task.description}</p>

      {/* Properties */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <p className="text-sm text-gray-500 uppercase font-semibold">State</p>
          <p className="text-lg font-medium text-gray-800">{task.status}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 uppercase font-semibold">Priority</p>
          <p className="text-lg font-medium text-gray-800">{task.priority}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 uppercase font-semibold">Start Date</p>
          <p className="text-lg font-medium text-gray-800">{task.startDate}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 uppercase font-semibold">Due Date</p>
          <p className="text-lg font-medium text-gray-800">{task.dueDate}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 uppercase font-semibold">Assignee</p>
          <div className="flex items-center gap-2">
            <User size={20} className="text-gray-500" />
            <p className="text-lg font-medium text-gray-800">{task.assignee}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500 uppercase font-semibold">Created By</p>
          <p className="text-lg font-medium text-gray-800">{task.createdBy}</p>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
