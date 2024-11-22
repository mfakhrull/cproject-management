"use client";

import React, { useEffect, useState } from "react";
import {
  Edit3,
  Trash2,
  Link2,
  Paperclip,
  PlusCircle,
  User,
} from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

const TaskDetailsPage = () => {
  const params = useParams();
  const tasksId = params?.tasksId;

  const [task, setTask] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tasksId) return;

    // Fetch task details with toast.promise
    const fetchTask = async () => {
      toast.promise(
        fetch(`/api/tasks/getTask?taskId=${tasksId}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch task details");
            }
            return response.json();
          })
          .then((data) => {
            setTask(data);
            return data; // Pass data to the success message
          })
          .catch((err) => {
            setError(err.message || "An unknown error occurred");
            throw err; // Pass error to the error message
          }),
        {
          loading: "Fetching task details...",
          success: (data) => `Task "${data.title}" loaded successfully!`,
          error: (err) => err.message || "Error loading task details!",
        }
      );
    };

    fetchTask();
  }, [tasksId]);

  if (!tasksId) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-red-500">
        Error: Missing Task ID
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-xl">
        Error: {error}
      </div>
    );
  }

  if (!task) {
    // No loading spinner needed because toast handles the loading state
    return null;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">{task.title || "Task Title"}</h1>
          <p className="text-lg text-gray-600">{task.description || "Task description"}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="p-2 text-gray-500 hover:text-gray-800 disabled:opacity-50"
            disabled
          >
            <Edit3 size={24} />
          </button>
          <button
            className="p-2 text-gray-500 hover:text-gray-800 disabled:opacity-50"
            disabled
          >
            <Trash2 size={24} />
          </button>
        </div>
      </div>

      {/* Properties */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div>
          <p className="text-sm text-gray-500 uppercase font-semibold mb-1">State</p>
          <p className="text-xl font-medium text-gray-800">{task.status || "Backlog"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Assignees</p>
          <div className="flex items-center gap-2">
            <User size={20} className="text-gray-500" />
            <p className="text-lg font-medium text-gray-800">
              {task.assignedUserId || "Unassigned"}
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Priority</p>
          <p className="text-xl font-medium text-gray-800">{task.priority || "Low"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Created By</p>
          <p className="text-lg font-medium text-gray-800">{task.authorId || "Unknown"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Start Date</p>
          <p className="text-lg font-medium text-gray-800">
            {new Date(task.startDate).toLocaleDateString() || "Not set"}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Due Date</p>
          <p className="text-lg font-medium text-gray-800">
            {new Date(task.dueDate).toLocaleDateString() || "Not set"}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-md text-gray-600 disabled:opacity-50"
          disabled
        >
          <PlusCircle size={18} />
          Add Sub-issue
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-md text-gray-600 disabled:opacity-50"
          disabled
        >
          <Link2 size={18} />
          Add Relation
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-md text-gray-600 disabled:opacity-50"
          disabled
        >
          <Paperclip size={18} />
          Attach
        </button>
      </div>

      {/* Tags */}
      <div className="mb-8">
        <p className="text-sm text-gray-500 uppercase font-semibold mb-2">Labels</p>
        <div className="flex gap-2 flex-wrap">
          {task.tags && task.tags.length > 0 ? (
            task.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-gray-500">No labels</span>
          )}
        </div>
      </div>

      {/* Activity Log */}
      <div>
        <p className="text-sm text-gray-500 uppercase font-semibold mb-2">Activity</p>
        <div className="bg-gray-100 p-4 rounded-md">
          <p className="text-gray-500">Activity logging is not implemented yet.</p>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPage;
