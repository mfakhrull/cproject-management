"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ITask } from "@/types";
import { useAppSelector } from "@/app/redux/redux";
import AssigneesModal from "@/components/task/AssigneesModal";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

// Define a type for the row data that converts ObjectId to string
type TaskRow = Omit<
  ITask,
  "_id" | "projectId" | "authorId" | "assignedUserIds" | "startDate" | "dueDate"
> & {
  id: string;
  projectId: string;
  authorId: string;
  assignedUserIds: string[]; // Maintain assignedUserIds as an array
  startDate: string; // Expect formatted string
  dueDate: string; // Expect formatted string
};

const TableView = ({ id, setIsModalNewTaskOpen }: Props) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null); // Track the selected task for modal

  const columns: GridColDef<TaskRow>[] = [
    { field: "title", headerName: "Title", width: 150 },
    { field: "description", headerName: "Description", width: 250 },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => (
        <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
          {params.value}
        </span>
      ),
    },
    { field: "priority", headerName: "Priority", width: 100 },
    { field: "tags", headerName: "Tags", width: 200 },
    { field: "startDate", headerName: "Start Date", width: 150 },
    { field: "dueDate", headerName: "Due Date", width: 150 },
    { field: "authorId", headerName: "Author", width: 200 },
    {
      field: "assignedUserIds",
      headerName: "Assignees",
      width: 150,
      renderCell: (params) => (
        <button
          className="text-blue-600 hover:underline"
          onClick={() => setSelectedTaskId(params.row.id)} // Open modal for selected task
        >
          View Assignees
        </button>
      ),
    },
  ];

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
  if (error) return <div>Error: {error}</div>;

  const rows: TaskRow[] = tasks.map((task) => ({
    id: task._id.toString(),
    projectId: task.projectId.toString(),
    authorId: task.authorId.toString(),
    assignedUserIds: task.assignedUserIds, // Pass array of assigned user IDs
    startDate: task.startDate
      ? new Date(task.startDate).toLocaleDateString()
      : "Not set",
    dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set",
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    tags: task.tags,
    points: task.points,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }));

  return (
    <div className="h-[540px] w-full px-4 pb-8 xl:px-6">
      <div className="pt-5">
        <Header
          name="Table"
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
      <DataGrid<TaskRow>
        rows={rows}
        columns={columns}
        className="rounded-md bg-white dark:bg-dark-secondary dark:text-white"
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
      {selectedTaskId && (
        <AssigneesModal
          isOpen={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)} // Close modal
          taskId={selectedTaskId}
        />
      )}
    </div>
  );
};

export default TableView;
