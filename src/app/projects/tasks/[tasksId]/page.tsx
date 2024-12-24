"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import TaskDetailsHeader from "@/components/task/TaskDetailsHeader";
import TimeTracker from "@/components/task/TimeTracker";
import TaskTags from "@/components/task/TaskTags";
import ActivityLog from "@/components/ActivityLog";
import { PlusCircle, Link2, Paperclip, MessageCircle, X } from "lucide-react";
import { ITask } from "@/types"; // Adjust the path to your ITask definition
import TaskAttachments from "@/components/task/TaskAttachments";
import { useAuth } from "@clerk/nextjs";

const TaskDetailsPage: React.FC = () => {
  const params = useParams();
  const { userId } = useAuth();
  const tasksId =
    typeof params.tasksId === "string" ? params.tasksId : params.tasksId?.[0];

  const [task, setTask] = useState<ITask | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDropzone, setShowDropzone] = useState(true);
  const [activityLogOpen, setActivityLogOpen] = useState(true); // Track sidebar state

  // Ref for ActivityLog component
  const activityLogRef = useRef<any>(null);

  // Fetch task details on page load
  useEffect(() => {
    if (!tasksId) return;

    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/tasks/getTask?taskId=${tasksId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch task details");
        }

        const data: ITask = await response.json();
        setTask(data);
        toast.success(`Task "${data.title}" loaded successfully!`);
      } catch (err: any) {
        setError(err.message || "An unknown error occurred");
        toast.error(err.message || "Error loading task details");
      }
    };

    fetchTask();
  }, [tasksId]);

  // Handle task updates
  const handleSave = async (updatedTask: Partial<ITask>) => {
    try {
      const response = await fetch(`/api/tasks/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: tasksId, updates: updatedTask }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updated: ITask = await response.json();
      setTask(updated); // Update local state with the latest task
      toast.success("Task updated successfully!");
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  if (!tasksId) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error: Missing Task ID
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Loading task details...
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error: User is not authenticated
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <div
        className={`mt-1 overflow-y-auto rounded bg-white p-6 px-10 shadow-sm transition-all duration-300 ${
          activityLogOpen ? "w-2/3" : "w-full"
        }`}
      >
        {/* Task Header with Save Handler */}
        <TaskDetailsHeader task={task} onSave={handleSave} />
        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <button className="flex items-center gap-2 rounded bg-gray-100 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200">
            <PlusCircle size={16} />
            Add Sub-issue
          </button>
          <button className="flex items-center gap-2 rounded bg-gray-100 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200">
            <Link2 size={16} />
            Add Relation
          </button>
          <button
            className="flex items-center gap-2 rounded bg-gray-100 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200"
            onClick={() => setShowDropzone((prev) => !prev)} // Toggle dropzone visibility
          >
            <Paperclip size={16} />
            Attach
          </button>
          {/* Time Tracking Component */}
          <TimeTracker taskId={tasksId} activityLogRef={activityLogRef} />
        </div>
        {/* Task Tags Component */}
        <TaskTags tags={task.tags || []} />
        {/* Dropzone Visibility */}
        {showDropzone && (
          <TaskAttachments
            taskId={tasksId}
            userId={userId}
            refreshActivityLog={() => activityLogRef.current?.refresh()} // Pass refresh method
          />
        )}
      </div>

      {/* Activity Log Sidebar */}
      <div
        className={`relative flex h-full transition-all duration-300 ${
          activityLogOpen ? "w-1/3" : "w-14 bg-white mt-1 me-2"
        }`}
      >
        {/* Toggle Button for Closed State */}
        {!activityLogOpen && (
          <button
            className="absolute left-1/2 top-4 flex -translate-x-1/2 transform flex-col items-center justify-center rounded bg-gray-100 p-2 shadow hover:bg-gray-200"
            onClick={() => setActivityLogOpen(true)}
          >
            <MessageCircle className="mx-auto text-gray-600 hover:text-gray-900" size={20} />
            <span className="mt-1 text-center text-xs text-gray-600">
              Activity
            </span>
          </button>
        )}

        {/* Activity Log Content */}
        {activityLogOpen && (
          <ActivityLog
            ref={activityLogRef}
            taskId={tasksId}
            isOpen={activityLogOpen}
          />
        )}

        {/* Close Button for Open State */}
        {activityLogOpen && (
          <button
            className="absolute right-4 top-8"
            onClick={() => setActivityLogOpen(false)}
          >
            <X size={20} className="text-gray-600 hover:text-gray-900" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskDetailsPage;
