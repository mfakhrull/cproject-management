"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import TaskDetailsHeader from "@/components/task/TaskDetailsHeader";
import TimeTracker from "@/components/task/TimeTracker";
import TaskTags from "@/components/task/TaskTags";
import ActivityLog from "@/components/ActivityLog";
import { PlusCircle, Link2, Paperclip } from "lucide-react";
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
      <div className="mt-1 w-2/3 overflow-y-auto rounded bg-white p-6 px-10 shadow-sm">
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

      {/* Activity Log Component */}
      <ActivityLog ref={activityLogRef} taskId={tasksId} />
    </div>
  );
};

export default TaskDetailsPage;
