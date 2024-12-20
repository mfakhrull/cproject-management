import React, { createContext, useContext, useState, useCallback } from "react";
import { ITask } from "@/types";

export type TaskContextType = {
  tasks: ITask[];
  fetchTasks: (projectId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, toStatus: ITask["status"]) => Promise<void>; 
  deleteTask: (taskId: string) => Promise<void>; // 🔥 Add this function
  isLoading: boolean;
  error: string | null;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch all tasks for a project
  const fetchTasks = useCallback(async (projectId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/getTasks?projectId=${projectId}`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data: ITask[] = await response.json();
      setTasks(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to update the task status (used for drag-and-drop or status change)
  const updateTaskStatus = useCallback(async (taskId: string, toStatus: ITask["status"]) => {
    try {
      const response = await fetch(`/api/tasks/updateTaskStatus?taskId=${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: toStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      // Optimistically update tasks state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, status: toStatus } : task
        )
      );
    } catch (err: any) {
      console.error("Error updating task status:", err.message);
    }
  }, []);

  // 🔥 New Function to delete a task
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/deleteTask`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId }),
      });

      if (!response.ok) throw new Error("Failed to delete task");

      // Remove the task from the tasks state
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));

      console.log(`Task with ID ${taskId} deleted successfully`);
    } catch (err: any) {
      console.error("Error deleting task:", err.message);
    }
  }, []);

  return (
    <TaskContext.Provider value={{ tasks, fetchTasks, updateTaskStatus, deleteTask, isLoading, error }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};
