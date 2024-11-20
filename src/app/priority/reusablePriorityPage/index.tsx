"use client";

import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/app/redux/redux";
import Header from "@/components/Header";
import TaskCard from "@/components/TaskCard";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ITask } from "@/types"; // Import the shared ITask interface

type Props = {
  priority: string; // Pass the priority dynamically
  userId: string; // Pass the userId dynamically
};

const columns: GridColDef<ITask>[] = [
  { field: "title", headerName: "Title", width: 150 },
  { field: "description", headerName: "Description", width: 250 },
  { field: "status", headerName: "Status", width: 150 },
  { field: "priority", headerName: "Priority", width: 150 },
  { field: "tags", headerName: "Tags", width: 200 },
  { field: "startDate", headerName: "Start Date", width: 150 },
  { field: "dueDate", headerName: "Due Date", width: 150 },
  {
    field: "authorId",
    headerName: "Author ID",
    width: 200,
  },
  {
    field: "assignedUserId",
    headerName: "Assignee ID",
    width: 200,
  },
];

const ReusablePriorityPage = ({ priority, userId }: Props) => {
  const [tasks, setTasks] = useState<ITask[]>([]); // Use ITask from types
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState("list");
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/tasks/getUserTasks?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data: ITask[] = await response.json();

        // Filter tasks by the specific priority
        const filteredTasks = data.filter((task) => task.priority === priority);
        setTasks(filteredTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [priority, userId]);

  if (isLoading) return <div>Loading tasks...</div>;
  if (!tasks.length)
    return <div>No tasks available for priority: {priority}</div>;

  return (
    <div className="m-5 p-4">
      <Header name={`Tasks with ${priority} Priority`} />
      <div className="mb-4 flex justify-start">
        <button
          className={`px-4 py-2 ${
            view === "list" ? "bg-gray-300" : "bg-white"
          } rounded-l`}
          onClick={() => setView("list")}
        >
          List
        </button>
        <button
          className={`px-4 py-2 ${
            view === "table" ? "bg-gray-300" : "bg-white"
          } rounded-l`}
          onClick={() => setView("table")}
        >
          Table
        </button>
      </div>
      {view === "list" ? (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      ) : (
        <div className="z-0 w-full">
          <DataGrid
            rows={tasks}
            columns={columns}
            getRowId={(row) => row._id}
            checkboxSelection
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
      )}
    </div>
  );
};

export default ReusablePriorityPage;
