// src/app/projects/ListView/index.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import TaskCard from "@/components/TaskCard";
import TaskDetailsWrapper from "../tasks/TaskDetailsWrapper";
import { ITask } from "@/types";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const ListView = ({ id, setIsModalNewTaskOpen }: Props) => {
  const [tasks, setTasks] = useState<ITask[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/tasks/getTasks?projectId=${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data: ITask[] = await response.json();
        setTasks(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, [id]);

  const openTaskDetails = (taskId: string) => {
    setSelectedTaskId(taskId); // Open side peek for task details
  };

  const openFullScreen = (taskId: string) => {
    router.push(`/projects/tasks/${taskId}`); // Redirect to full-screen task details
  };

  const closeTaskDetails = () => {
    setSelectedTaskId(null); // Close the side peek
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error}</div>;

  return (
    <div className="px-4 pb-8 xl:px-6">
      {/* Header */}
      <div className="pt-5">
        <Header
          name="List"
          // buttonComponent={
          //   <button
          //     className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
          //     onClick={() => setIsModalNewTaskOpen(true)}
          //   >
          //     Add Task
          //   </button>
          // }
          isSmallText
        />
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {tasks?.map((task) => (
          <TaskCard
            key={task._id.toString()}
            task={task}
            onClick={() => openTaskDetails(task._id.toString())} // Open side peek when clicking a task
          />
        ))}
      </div>

      {/* Side Peek */}
      {selectedTaskId && (
        <TaskDetailsWrapper
          taskId={selectedTaskId}
          mode="peek" // Always use "peek" for side layout
          onClose={closeTaskDetails} // Close side peek
        />
      )}
    </div>
  );
};

export default ListView;
