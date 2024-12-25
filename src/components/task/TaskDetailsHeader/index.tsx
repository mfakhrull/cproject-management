"use client";

import React, { useState } from "react";
import { Edit3, Trash2 } from "lucide-react";
import TaskUpdateModal from "@/components/task/TaskUpdateModal";
import { ITask } from "@/types"; // Adjust the path to where your ITask interface is located
import FloatingTooltip from "@/components/FloatingTooltip"; // Import your tooltip component
import { useUserPermissions } from "@/context/UserPermissionsContext"; // Import the permissions hook

interface TaskDetailsHeaderProps {
  task: ITask; // Use the ITask interface for type safety
  onSave: (updatedTask: Partial<ITask>) => Promise<void>; // Callback for saving task updates
}

const TaskDetailsHeader: React.FC<TaskDetailsHeaderProps> = ({
  task,
  onSave,
}) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const { permissions } = useUserPermissions(); // Get user permissions

  const handleSave = async (updatedTask: Partial<ITask>) => {
    try {
      await onSave(updatedTask);
      setModalOpen(false);
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  };

  const canEditTask =
    permissions.includes("can_edit_task") ||
    permissions.includes("admin") ||
    permissions.includes("project_manager");

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-3">
        <div>
          <h1 className="mb-1 text-2xl font-medium text-gray-800">
            {task.title}
          </h1>
          <p className="text-sm text-gray-600">
            {task.description || "No description provided"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!canEditTask ? (
            <FloatingTooltip message="Permission Required">
              <button
                onClick={() => setModalOpen(true)}
                disabled
                className="cursor-not-allowed p-2 text-gray-400"
              >
                <Edit3 size={20} />
              </button>
            </FloatingTooltip>
          ) : (
            <button
              onClick={() => setModalOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <Edit3 size={20} />
            </button>
          )}

          {/* <button
            className="p-2 text-gray-500 hover:text-gray-700"
            disabled
            title="Delete functionality not implemented yet"
          >
            <Trash2 size={20} />
          </button> */}
        </div>
      </div>

      {/* Task Properties */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "State", value: task.status },
          { label: "Assignees", value: task.assignedUserId || "Unassigned" },
          { label: "Priority", value: task.priority },
          { label: "Time Estimate", value: task.timeEstimate || "Unspecified" },
          {
            label: "Start Date",
            value: task.startDate
              ? new Date(task.startDate).toLocaleDateString()
              : "Not set",
          },
          {
            label: "Due Date",
            value: task.dueDate
              ? new Date(task.dueDate).toLocaleDateString()
              : "Not set",
          },
        ].map((item, index) => (
          <div key={index}>
            <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
              {item.label}
            </p>
            <p className="text-sm text-gray-800">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Task Update Modal */}
      <TaskUpdateModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        task={task}
        onSave={handleSave}
      />
    </div>
  );
};

export default TaskDetailsHeader;
