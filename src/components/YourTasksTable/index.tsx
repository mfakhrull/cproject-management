"use client";

import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface ITask {
  _id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
}

interface YourTasksTableProps {
  tasks: ITask[];
  isLoading: boolean;
  isDarkMode: boolean;
}

const YourTasksTable: React.FC<YourTasksTableProps> = ({
  tasks,
  isLoading,
  isDarkMode,
}) => {
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "todo":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const rows = tasks.map((task) => ({
    ...task,
    id: task._id, // Map `_id` to `id` for DataGrid
    formattedDueDate: new Intl.DateTimeFormat("en-MY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(task.dueDate)),
  }));

  const taskColumns: GridColDef[] = [
    { field: "title", headerName: "Title", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <span
          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusClass(
            params.row.status
          )}`}
        >
          {params.row.status}
        </span>
      ),
    },
    {
      field: "priority",
      headerName: "Priority",
      flex: 1,
      renderCell: (params) => (
        <span
          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getPriorityClass(
            params.row.priority
          )}`}
        >
          {params.row.priority}
        </span>
      ),
    },
    {
      field: "formattedDueDate",
      headerName: "Due Date",
      flex: 1,
    },
  ];

  return (
    <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary mt-6">
      <h3 className="mb-4 text-lg font-semibold dark:text-white">Your Tasks</h3>
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
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
  );
};

export default YourTasksTable;
