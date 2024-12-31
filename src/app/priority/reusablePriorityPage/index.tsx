"use client";

import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/app/redux/redux";
import Header from "@/components/Header";
import TaskCard from "@/components/TaskCard";
import AssigneesModal from "@/components/task/AssigneesModal";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { ITask } from "@/types";
import { useUserPermissions } from "@/context/UserPermissionsContext";
import { format } from "date-fns";

// Extended ITask with UI-specific fields while keeping original fields
interface ITaskWithUI extends Omit<ITask, '_id' | 'startDate' | 'dueDate'> {
  id: string; // renamed from _id for DataGrid
  startDate: string; // converted to formatted string for display
  dueDate: string; // converted to formatted string for display
  authorName: string; // display name
  assigneeNames: string[]; // display names
}

type Props = {
  priority: string;
};

const ReusablePriorityPage = ({ priority }: Props) => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState("list");
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { permissions, employeeId } = useUserPermissions();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const headers: Record<string, string> = {
          permissions: JSON.stringify(permissions),
          employeeId: employeeId || "",
        };

        const response = await fetch("/api/tasks/getTasksForPriority", {
          method: "GET",
          headers,
        });

        if (!response.ok) throw new Error("Failed to fetch tasks");

        const data: ITask[] = await response.json();
        const filteredTasks = data.filter((task) => task.priority === priority);
        setTasks(filteredTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [priority, permissions, employeeId]);

  const columns: GridColDef<ITaskWithUI>[] = [
    { field: "title", headerName: "Title", width: 150 },
    { field: "description", headerName: "Description", width: 250 },
    { 
      field: "status", 
      headerName: "Status", 
      width: 150,
      renderCell: (params: GridRenderCellParams<ITaskWithUI>) => (
        <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
          {params.value}
        </span>
      ),
    },
    { field: "priority", headerName: "Priority", width: 150 },
    {
      field: "tags",
      headerName: "Tags",
      width: 200,
      valueGetter: ({ row }: GridRenderCellParams<ITaskWithUI>) => row?.tags?.join(", ") || "No tags",
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 150,
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      width: 150,
    },
  ];
  
  // Transform ITask[] to ITaskWithUI[]
  const rows: ITaskWithUI[] = tasks.map((task) => ({
    ...task,
    id: task._id, // DataGrid requires 'id' field
    startDate: task.startDate ? format(new Date(task.startDate), "P") : "Not set",
    dueDate: task.dueDate ? format(new Date(task.dueDate), "P") : "Not set",
    authorName: `Author ${task.authorId}`, // Replace with actual lookup
    assigneeNames: task.assignedUserIds.map(id => `User ${id}`), // Replace with actual lookup
  }));
  

  return (
    <div className="m-5 p-4">
      <Header name={`Tasks with ${priority} Priority`} />
      <div className="mb-4 flex justify-start">
        <button
          className={`px-4 py-2 ${view === "list" ? "bg-gray-300" : "bg-white"} rounded-l`}
          onClick={() => setView("list")}
        >
          List
        </button>
        <button
          className={`px-4 py-2 ${view === "table" ? "bg-gray-300" : "bg-white"} rounded-l`}
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
          <DataGrid<ITaskWithUI>
            rows={rows}
            columns={columns}
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

      {selectedTaskId && (
        <AssigneesModal
          isOpen={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          taskId={selectedTaskId}
        />
      )}
    </div>
  );
};

export default ReusablePriorityPage;