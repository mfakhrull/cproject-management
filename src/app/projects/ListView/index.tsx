"use client";

import Header from "@/components/Header";
import TaskCard from "@/components/TaskCard";
import React, { useEffect, useState } from "react";
import { ITask } from "@/types";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const ListView = ({ id, setIsModalNewTaskOpen }: Props) => {
  const [tasks, setTasks] = useState<ITask[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error}</div>;

  return (
    <div className="px-4 pb-8 xl:px-6">
      <div className="pt-5">
        <Header
          name="List"
          buttonComponent={
            <button
              className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              Add Task
            </button>
          }
          isSmallText
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {tasks?.map((task) => (
          <TaskCard key={task._id.toString()} task={task} />
        ))}
      </div>
    </div>
  );
};

export default ListView;
