"use client";

import { useAppSelector } from "@/app/redux/redux"; // Adjusted redux path if necessary
import { useUserPermissions } from "@/context/UserPermissionsContext"; // Import UserPermissionsContext
import Header from "@/components/Header";
import { DisplayOption, Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import React, { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";

type Project = {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number | null; // Progress can be null initially
};

const Timeline = () => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const {
    permissions,
    employeeId,
    loading: permissionsLoading,
  } = useUserPermissions();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  useEffect(() => {
    const fetchProjects = async () => {
      if (permissionsLoading) return; // Wait for permissions to load
      if (!permissions || !employeeId) {
        setError("Missing permissions or employeeId.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/projects/readfortimeline", {
          method: "GET",
          headers: {
            permissions: JSON.stringify(permissions),
            employeeId: employeeId,
          },
        });
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
  }, [permissions, employeeId, permissionsLoading]);

  const ganttTasks: Task[] = useMemo(() => {
    return (
      projects.map((project) => ({
        start: new Date(project.startDate),
        end: new Date(project.endDate),
        name: project.name,
        id: `Project-${project._id}`,
        type: "project",
        progress: project.progress ?? 0, // Ensure 0 is not overridden by a fallback
        isDisabled: false,
        styles: {
          backgroundColor: isDarkMode ? "#1f2937" : "#d1e7dd",
          progressColor: isDarkMode ? "#34d399" : "#2c7a7b",
          progressSelectedColor: "#2563eb",
        },
      })) || []
    );
  }, [projects, isDarkMode]);

  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  const exportToCSV = () => {
    // Prepare CSV data
    const csvHeaders = ["Project Name", "Start Date", "End Date", "Progress"];
    const csvRows = projects.map((project) => [
      project.name,
      new Date(project.startDate).toLocaleDateString(),
      new Date(project.endDate).toLocaleDateString(),
      `${project.progress ?? 0}%`,
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map((row) => row.join(","))
      .join("\n");

    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "projects_timeline.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading || permissionsLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-100"} p-8`}
    >
      {/* Header Section */}
      <header className="mb-8">
        <h1
          className={`text-3xl font-bold ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Projects Timeline
        </h1>
        <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} mt-2`}>
          View and track project schedules and progress in one place.
        </p>
      </header>

      {/* Timeline Section */}
      <div
        className={`rounded-lg shadow-lg ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white"
        } p-6`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2
            className={`text-xl font-semibold ${
              isDarkMode ? "text-gray-200" : "text-gray-800"
            }`}
          >
            Gantt Chart
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

        <div
          className={`overflow-hidden rounded-md ${
            isDarkMode ? "bg-gray-700" : "bg-gray-50"
          }`}
        >
          <Gantt
            tasks={ganttTasks}
            {...displayOptions}
            columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
            listCellWidth="200px" // Wider task list
            rowHeight={40} // Increased row height for better readability
            headerHeight={50} // Increased header height
            fontFamily="Arial, sans-serif"
            fontSize="14px"
            barCornerRadius={5} // Rounded taskbars
            barFill={75} // Occupation percentage for taskbars
            todayColor="#f3f4f6" // Highlight today column
          />
        </div>

        {/* Export Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 text-slate-800 hover:text-slate-700 focus:outline-none"
          >
            <Download size={16} />
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
