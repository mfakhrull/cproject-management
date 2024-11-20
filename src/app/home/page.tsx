"use client";

import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Header from "@/components/Header";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppSelector } from "@/app/redux/redux";

// Define data types
interface ITask {
  _id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
}

interface IProject {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
}

// Define columns for tasks
const taskColumns: GridColDef<ITask>[] = [
  { field: "title", headerName: "Title", width: 200 },
  { field: "status", headerName: "Status", width: 150 },
  { field: "priority", headerName: "Priority", width: 150 },
  { field: "dueDate", headerName: "Due Date", width: 150 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const HomePage = () => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const [tasks, setTasks] = useState<ITask[]>([]);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch all tasks
        const tasksResponse = await fetch("/api/tasks/getTasks");
        if (!tasksResponse.ok) throw new Error("Failed to fetch tasks.");
        const tasksData: ITask[] = await tasksResponse.json();

        // Map `_id` to `id` for DataGrid compatibility
        const mappedTasks = tasksData.map((task) => ({
          ...task,
          id: task._id, // Use `_id` as `id`
        }));
        setTasks(mappedTasks);

        // Fetch all projects
        const projectsResponse = await fetch("/api/projects/read");
        if (!projectsResponse.ok) throw new Error("Failed to fetch projects.");
        const projectsData: IProject[] = await projectsResponse.json();
        setProjects(projectsData);
      } catch (err: any) {
        console.error("Error:", err.message);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Calculate priority distribution for the bar chart
  const priorityCount = tasks.reduce(
    (acc: Record<string, number>, task: ITask) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    },
    {}
  );

  const taskDistribution = Object.keys(priorityCount).map((key) => ({
    name: key,
    count: priorityCount[key],
  }));

  // Calculate project status distribution for the pie chart
// Calculate project status distribution dynamically
const statusCount = tasks.reduce(
    (acc: Record<string, number>, task: ITask) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    },
    {}
  );
  
  const projectStatus = Object.keys(statusCount).map((key) => ({
    name: key,
    count: statusCount[key],
  }));
  

  const chartColors = isDarkMode
    ? {
        bar: "#8884d8",
        barGrid: "#303030",
        pieFill: "#4A90E2",
        text: "#FFFFFF",
      }
    : {
        bar: "#8884d8",
        barGrid: "#E0E0E0",
        pieFill: "#82ca9d",
        text: "#000000",
      };

  return (
    <div className="container h-full w-[100%] bg-gray-100 bg-transparent p-8">
      <Header name="Project Management Dashboard" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary">
          <h3 className="mb-4 text-lg font-semibold dark:text-white">
            Task Priority Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskDistribution}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={chartColors.barGrid}
              />
              <XAxis dataKey="name" stroke={chartColors.text} />
              <YAxis stroke={chartColors.text} />
              <Tooltip
                contentStyle={{
                  width: "min-content",
                  height: "min-content",
                }}
              />
              <Legend />
              <Bar dataKey="count" fill={chartColors.bar} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary">
          <h3 className="mb-4 text-lg font-semibold dark:text-white">
            Project Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                dataKey="count"
                data={projectStatus}
                cx="50%"
                cy="50%"
                fill={chartColors.pieFill}
                label
              >
                {projectStatus.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary md:col-span-2">
          <h3 className="mb-4 text-lg font-semibold dark:text-white">
            Your Tasks
          </h3>
          <div style={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={tasks}
              columns={taskColumns}
              getRowId={(row) => row._id}
              checkboxSelection
              loading={isLoading}
              className="data-grid-class"
              sx={{
                "& .MuiDataGrid-root": {
                  borderColor: isDarkMode ? "#444" : "#ddd",
                },
                "& .MuiDataGrid-cell": {
                  color: isDarkMode ? "#fff" : "#000",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: isDarkMode ? "#333" : "#f5f5f5",
                  color: isDarkMode ? "#fff" : "#000",
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: isDarkMode ? "#333" : "#f5f5f5",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
