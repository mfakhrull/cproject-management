"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import TaskPriorityChart from "@/components/TaskPriorityChart";
import ProjectStatusChart from "@/components/ProjectStatusChart";
import YourTasksTable from "@/components/YourTasksTable";
import MaintenanceList from "@/components/MaintenanceList";
import MaintenanceHistoryModal from "@/components/MaintenanceHistoryModal";
import { useAppSelector } from "../redux/redux";
import { toast } from "sonner"; // Import sonner toast
import FloatingTooltip from "@/components/FloatingTooltip";
import { Info } from "lucide-react";

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

interface MaintenanceItem {
  specificItemId: string;
  maintenanceSchedule: string;
  location: string;
  status: string;
  maintenanceType?: string[];
}

const HomePage = () => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const [tasks, setTasks] = useState<ITask[]>([]);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MaintenanceItem | null>(
    null,
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Track refresh state

  // Fetch tasks and projects
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const tasksResponse = await fetch("/api/tasks/getTasks");
        if (!tasksResponse.ok) throw new Error("Failed to fetch tasks.");
        const tasksData: ITask[] = await tasksResponse.json();
        setTasks(tasksData);

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

  // Fetch maintenance items
  useEffect(() => {
    const fetchMaintenanceItems = async () => {
      try {
        const response = await fetch("/api/inventory/maintenance");
        if (!response.ok) throw new Error("Failed to fetch maintenance items.");
        const data = await response.json();
        setMaintenanceItems(data.flatMap((inventory: any) => inventory.items));
      } catch (err: any) {
        console.error("Error fetching maintenance items:", err.message);
        setError(err.message);
      }
    };

    fetchMaintenanceItems();
  }, []);

  const refreshMaintenanceItems = async () => {
    try {
      const response = await fetch("/api/inventory/maintenance");
      if (!response.ok) throw new Error("Failed to refresh maintenance items.");
      const data = await response.json();
      setMaintenanceItems(data.flatMap((inventory: any) => inventory.items));
      setRefreshTrigger((prev) => prev + 1); // Increment to trigger re-fetch
    } catch (err: any) {
      console.error("Error refreshing maintenance items:", err.message);
    }
  };

  const handleOpenModal = (item: MaintenanceItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSaveMaintenance = async (
    newDate: string,
    history?: { date: string; maintenanceType: string[] },
  ) => {
    if (!selectedItem) return;

    try {
      const response = await fetch(
        `/api/inventory/maintenance/${selectedItem.specificItemId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newDate, history }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update maintenance schedule.");
      }

      toast.success("Maintenance updated successfully!"); // Toast for success
      setIsModalOpen(false);
      await refreshMaintenanceItems(); // Refresh list
    } catch (error) {
      toast.error("Failed to update maintenance schedule."); // Toast for error
      console.error("Error updating maintenance schedule:", error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const priorityCount = tasks.reduce(
    (acc: Record<string, number>, task: ITask) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    },
    {},
  );

  const taskDistribution = Object.keys(priorityCount).map((key) => ({
    priority: key,
    count: priorityCount[key],
  }));

  const statusCount = tasks.reduce(
    (acc: Record<string, number>, task: ITask) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    },
    {},
  );

  const projectStatus = Object.keys(statusCount).map((key) => ({
    name: key,
    count: statusCount[key],
  }));

  return (
    <div className="container h-full w-[100%] bg-gray-100 bg-transparent p-8">
      <Header name="Project Management Dashboard" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TaskPriorityChart taskDistribution={taskDistribution} />
        <ProjectStatusChart projectStatus={projectStatus} />
      </div>
      <YourTasksTable
        tasks={tasks}
        isLoading={isLoading}
        isDarkMode={isDarkMode}
      />

      {/* Maintenance List */}
      <div className="mt-8">
        
        <MaintenanceList
          apiUrl="/api/inventory/maintenance"
          onUpdate={(item) => handleOpenModal(item)}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Maintenance History Modal */}
      <MaintenanceHistoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemId={selectedItem?.specificItemId || ""}
        maintenanceType={selectedItem?.maintenanceType || []}
        onSave={handleSaveMaintenance}
      />
    </div>
  );
};

export default HomePage;
