"use client";

import React, { useMemo, useState } from "react";
import { ITask } from "@/types";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

type TaskTypeItems = "task" | "milestone" | "project";

const Timeline = ({ id, setIsModalNewTaskOpen }: Props) => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  React.useEffect(() => {
    const fetchTasks = async () => {
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

  const ganttTasks = useMemo(() => {
    return (
      tasks.map((task) => ({
        start: task.startDate ? new Date(task.startDate) : new Date(),
        end: task.dueDate ? new Date(task.dueDate) : new Date(),
        name: task.title,
        id: task._id.toString(),
        type: "task" as TaskTypeItems,
        progress: task.points ? (task.points / 10) * 100 : 0,
        isDisabled: false,
      })) || []
    );
  }, [tasks]);

  const handleViewModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8 dark:bg-gray-900">
      {/* Header Section */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Project Tasks Timeline
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Visualize tasks for your project timeline.
        </p>
      </header>

      {/* Timeline Section */}
      <div className="rounded-lg bg-white shadow-lg dark:bg-gray-800">
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Task Timeline
          </h2>
          <div className="relative inline-block w-48">
            <select
              className="block w-full rounded border border-gray-400 bg-white px-4 py-2 pr-8 text-gray-700 shadow focus:border-blue-500 focus:outline-none focus:ring dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              value={displayOptions.viewMode}
              onChange={handleViewModeChange}
            >
              <option value={ViewMode.Day}>Day</option>
              <option value={ViewMode.Week}>Week</option>
              <option value={ViewMode.Month}>Month</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-b-lg">
          <div className="timeline">
            <Gantt
              tasks={ganttTasks}
              {...displayOptions}
              columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
              listCellWidth="150px" // Adjusted width for side columns
              barBackgroundColor="#aeb8c2"
              barBackgroundSelectedColor="#9ba1a6"
              barProgressColor="#4caf50"
              barProgressSelectedColor="#2563eb"
            />
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex justify-end p-6">
          {/* <button
            className="flex items-center rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            + Add New Task
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
