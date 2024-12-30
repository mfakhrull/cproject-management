// src/components/YourTasksTable.tsx
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
  const taskColumns: GridColDef<ITask>[] = [
    { field: "title", headerName: "Title", width: 200 },
    { field: "status", headerName: "Status", width: 150 },
    { field: "priority", headerName: "Priority", width: 150 },
    { field: "dueDate", headerName: "Due Date", width: 150 },
  ];

  return (
    <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary mt-6">
      <h3 className="mb-4 text-lg font-semibold dark:text-white">
        Your Tasks
      </h3>
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={tasks.map((task) => ({
            ...task,
            id: task._id, // Ensure DataGrid uses `id` instead of `_id`
          }))}
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
