// src/app/projects/tasks/TaskDetailsWrapper.tsx

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import TaskDetails from "./TaskDetails";

interface TaskDetailsWrapperProps {
  taskId: string;
  mode: "peek"; // Only peek layout remains
  onClose?: () => void; // For closing the peek view
}

const TaskDetailsWrapper: React.FC<TaskDetailsWrapperProps> = ({
  taskId,
  mode,
  onClose,
}) => {
  const [task, setTask] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const fetchTaskDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/tasks/getTask?taskId=${taskId}`);
        if (!res.ok) throw new Error("Failed to fetch task details");

        const data = await res.json();
        setTask(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch task details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskDetails();
  }, [taskId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full text-xl">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-500 text-xl">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-1/3 bg-white shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-xl font-semibold">Task Details</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            Close
          </button>
        )}
      </div>

      {/* Task Details */}
      <div className="mt-4">
        <TaskDetails task={task} />
      </div>

      {/* Open Full-Screen Button */}
      <div className="mt-6 flex justify-end">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => router.push(`/projects/tasks/${taskId}`)}
        >
          Open Full Screen
        </button>
      </div>
    </div>
  );
};

export default TaskDetailsWrapper;
