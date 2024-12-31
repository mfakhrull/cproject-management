"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ITask, IUser } from "@/types";

interface TaskUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: ITask;
  onSave: (updatedTask: Partial<ITask>) => Promise<void>;
}

const TaskUpdateModal: React.FC<TaskUpdateModalProps> = ({
  isOpen,
  onClose,
  task,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timeEstimate: "",
    status: task.status as 'TODO' | 'IN_PROGRESS' | 'COMPLETED', // Explicitly typed
    priority: task.priority as 'LOW' | 'MEDIUM' | 'HIGH'| 'URGENT'| 'BACKLOG', // Explicitly typed
    assignedUserIds: [] as string[], // Handle multiple assignees
    startDate: "",
    dueDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<IUser[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Pre-fill form data with task details
      setFormData({
        title: task.title,
        description: task.description || "",
        timeEstimate: task.timeEstimate || "",
        status: task.status,
        priority: task.priority,
        assignedUserIds: task.assignedUserIds || [],
        startDate: task.startDate
          ? new Date(task.startDate).toISOString().split("T")[0]
          : "",
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "",
      });

      // Fetch user list
      const fetchUsers = async () => {
        try {
          const response = await fetch("/api/users/getUsers");
          if (!response.ok) {
            throw new Error("Failed to fetch users");
          }
          const data: IUser[] = await response.json();
          setUsers(data);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };

      fetchUsers();
    }
  }, [isOpen, task]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAddAssignee = (userId: string) => {
    if (!formData.assignedUserIds.includes(userId)) {
      setFormData((prevData) => ({
        ...prevData,
        assignedUserIds: [...prevData.assignedUserIds, userId],
      }));
    }
  };

  const handleRemoveAssignee = (userId: string) => {
    setFormData((prevData) => ({
      ...prevData,
      assignedUserIds: prevData.assignedUserIds.filter((id) => id !== userId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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
              value={formData.description}
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
                <option value="URGENT">Urgent</option>
                <option value="BACKLOG">Backlog</option>
              </select>
            </div>
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Assignees
            </label>
            <div className="flex gap-2">
              <select
                onChange={(e) => handleAddAssignee(e.target.value)}
                className="block w-full rounded-md bg-white px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
              >
                <option value="">Select Assignee</option>
                {users
                  .filter((user) => !formData.assignedUserIds.includes(user.clerk_id))
                  .map((user) => (
                    <option key={user.clerk_id} value={user.clerk_id}>
                      {user.username} ({user.role || "No Role"})
                    </option>
                  ))}
              </select>
            </div>
            <ul className="mt-4 space-y-2">
              {formData.assignedUserIds.map((userId) => {
                const user = users.find((u) => u.clerk_id === userId);
                return (
                  <li
                    key={userId}
                    className="flex items-center justify-between rounded-lg border border-gray-300 bg-white p-3 shadow-sm"
                  >
                    <span>{user?.username || "Unknown"} ({user?.role || "No Role"})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAssignee(userId)}
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
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
                value={formData.startDate}
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
                value={formData.dueDate}
                onChange={handleInputChange}
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-6 mt-8">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskUpdateModal;
