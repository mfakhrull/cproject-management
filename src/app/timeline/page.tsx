"use client";

import { useAppSelector } from "@/app/redux/redux"; // Adjusted redux path if necessary
import Header from "@/components/Header";
import { DisplayOption, Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import React, { useEffect, useMemo, useState } from "react";

type Project = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

const Timeline = () => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects/read"); // Adjust API path as needed
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data: Project[] = await response.json();
        setProjects(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const ganttTasks: Task[] = useMemo(() => {
    return (
      projects.map((project) => ({
        start: new Date(project.startDate),
        end: new Date(project.endDate),
        name: project.name,
        id: `Project-${project.id}`,
        type: "project",
        progress: 50, // Adjust progress calculation if needed
        isDisabled: false,
      })) || []
    );
  }, [projects]);

  const handleViewModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-full p-8">
      {/* Header Section */}
      <header className="mb-4 flex items-center justify-between">
        <Header name="Projects Timeline" />
        <div className="relative inline-block w-64">
          <select
            className="focus:shadow-outline block w-full appearance-none rounded border border-gray-400 bg-white px-4 py-2 pr-8 leading-tight shadow hover:border-gray-500 focus:outline-none dark:border-dark-secondary dark:bg-dark-secondary dark:text-white"
            value={displayOptions.viewMode}
            onChange={handleViewModeChange}
          >
            <option value={ViewMode.Day}>Day</option>
            <option value={ViewMode.Week}>Week</option>
            <option value={ViewMode.Month}>Month</option>
          </select>
        </div>
      </header>

      {/* Timeline Section */}
      <div className="overflow-hidden rounded-md bg-white shadow dark:bg-dark-secondary dark:text-white">
        <div className="timeline">
          <Gantt
            tasks={ganttTasks}
            {...displayOptions}
            columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
            listCellWidth="100px"
            projectBackgroundColor={isDarkMode ? "#101214" : "#1f2937"}
            projectProgressColor={isDarkMode ? "#1f2937" : "#aeb8c2"}
            projectProgressSelectedColor={isDarkMode ? "#000" : "#9ba1a6"}
          />
        </div>
      </div>
    </div>
  );
};

export default Timeline;
