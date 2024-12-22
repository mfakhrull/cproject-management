"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ITask } from "@/types";

interface TaskUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: ITask;
  onSave: (updatedTask: Partial<ITask>) => Promise<void>;
}

// Create a separate interface for form data to handle string dates
interface TaskFormData {
  title: string;
  description?: string;
  timeEstimate?: string;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  assignedUserId?: string;
  startDate?: string;
  dueDate?: string;
}

const TaskUpdateModal: React.FC<TaskUpdateModalProps> = ({
  isOpen,
  onClose,
  task,
  onSave,
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    status: "TODO",
    priority: "LOW",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: task.title,
        description: task.description || "",
        timeEstimate: task.timeEstimate || "",
        status: task.status,
        priority: task.priority,
        assignedUserId: task.assignedUserId || "",
        startDate: task.startDate
          ? new Date(task.startDate).toISOString().split("T")[0]
          : "",
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "",
      });
    }
  }, [isOpen, task]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert string dates to Date objects for the API
      const updatedTask: Partial<ITask> = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      };

      await onSave(updatedTask);
      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl px-12 py-8">
        <h2 className="text-3xl font-semibold mb-8">Update Task Details</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title and Description */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-900">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-2 block w-full rounded-md bg-white px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-900">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              className="mt-2 block w-full rounded-md bg-white px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
              rows={4}
            />
          </div>

          {/* Task Properties */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-900">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
                required
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-900">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
                required
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="assignedUserId" className="block text-sm font-medium text-gray-900">
                Assignee
              </label>
              <input
                type="text"
                id="assignedUserId"
                name="assignedUserId"
                value={formData.assignedUserId || ""}
                onChange={handleInputChange}
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
              />
            </div>
            <div>
              <label htmlFor="timeEstimate" className="block text-sm font-medium text-gray-900">
                Time Estimate
              </label>
              <input
                type="text"
                id="timeEstimate"
                name="timeEstimate"
                value={formData.timeEstimate || ""}
                onChange={handleInputChange}
                placeholder="e.g., 2h 30m"
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-900">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate || ""}
                onChange={handleInputChange}
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
              />
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-900">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate || ""}
                onChange={handleInputChange}
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-6 mt-8">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="px-8 py-3"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="px-8 py-3">
              {loading ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskUpdateModal;
