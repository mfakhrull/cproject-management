"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import TaskPriorityChart from "@/components/TaskPriorityChart";
import TaskStatusChart from "@/components/TaskStatusChart";
import YourTasksTable from "@/components/YourTasksTable";
import MaintenanceList from "@/components/MaintenanceList";
import MaintenanceHistoryModal from "@/components/MaintenanceHistoryModal";
import ManagerLeavePage from "@/app/leaves/manager/page";
import EmployeeLeavePage from "@/app/leaves/employee/page";
import { useAppSelector } from "../redux/redux";
import { toast } from "sonner";
import { useUserPermissions } from "@/context/UserPermissionsContext";

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
  status: string;
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
  const { permissions, employeeId } = useUserPermissions(); // Move hook to component level

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch tasks with proper permissions
  useEffect(() => {
    const fetchTasks = async () => {
      console.log("Fetching tasks...");
      setIsLoading(true);
      setError(null);

      try {
        console.log("Permissions:", permissions, "Employee ID:", employeeId);

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          permissions: JSON.stringify(permissions),
          employeeId: employeeId || "",
        };

        const tasksResponse = await fetch("/api/tasks/getTasksForDashboard", {
          method: "GET",
          headers,
        });

        if (!tasksResponse.ok) {
          const errorData = await tasksResponse.json();
          throw new Error(errorData.message || "Failed to fetch tasks.");
        }

        const tasksData = await tasksResponse.json();
        console.log("Fetched tasks:", tasksData);
        setTasks(tasksData);
      } catch (err: any) {
        console.error("Error fetching tasks:", err.message);
        setError(err.message);
        toast.error("Failed to load tasks: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (permissions && employeeId) {
      fetchTasks();
    }
  }, [permissions, employeeId]); // Add dependencies

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'permissions': JSON.stringify(permissions),
          'employeeId': employeeId || "",
        };
  
        const projectsResponse = await fetch("/api/projects/readforchart", {
          method: "GET",
          headers,
        });
  
        if (!projectsResponse.ok) {
          const errorData = await projectsResponse.json();
          throw new Error(errorData.message || "Failed to fetch projects.");
        }
  
        const projectsData: IProject[] = await projectsResponse.json();
        console.log("Fetched projects:", projectsData);
        setProjects(projectsData);
      } catch (err: any) {
        console.error("Error fetching projects:", err.message);
        setError(err.message);
        toast.error("Failed to load projects: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };
  
    if (permissions && employeeId) {
      fetchProjects();
    }
  }, [permissions, employeeId]); // Add dependencies

  const refreshMaintenanceItems = async () => {
    try {
      const response = await fetch("/api/inventory/maintenance");
      if (!response.ok) throw new Error("Failed to refresh maintenance items.");
      const data = await response.json();
      setMaintenanceItems(data.flatMap((inventory: any) => inventory.items));
      setRefreshTrigger((prev) => prev + 1);
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

      toast.success("Maintenance updated successfully!");
      setIsModalOpen(false);
      await refreshMaintenanceItems();
    } catch (error) {
      toast.error("Failed to update maintenance schedule.");
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

  const taskStatus = Object.keys(statusCount).map((key) => ({
    name: key,
    count: statusCount[key],
  }));

  // Calculate project status distribution
  const projectStatusCount = projects.reduce(
    (acc: Record<string, number>, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    },
    {},
  );

  const projectStatusOrder = ["COMPLETED", "IN_PROGRESS", "PLANNING"]; // Define the desired order

  const projectStatusDistribution = projectStatusOrder.map((key) => ({
    name: key,
    count: projectStatusCount[key] || 0, // Ensure missing statuses are included with a count of 0
  }));

  return (
    <div className="flex min-h-screen justify-center bg-gray-100">
      <div className="container mx-auto max-w-[90%] px-4 sm:px-6 lg:px-8">
        <div className="w-full py-8">
          {/* Header */}
          <Header name="Project Management Dashboard" />

          {/* Charts */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <TaskPriorityChart taskDistribution={taskDistribution} />
            <TaskStatusChart taskStatus={taskStatus} />
            <TaskStatusChart
              taskStatus={projectStatusDistribution}
              colorMapping={{
                PLANNING: "#274754",
                IN_PROGRESS: "#2A9D90",
                COMPLETED: "#E76E50",
              }}
              title="Project Status Distribution"
              description="Overview of project by status"
            />
          </div>

          {/* Tasks Table */}
          <YourTasksTable
            tasks={tasks}
            isLoading={isLoading}
            isDarkMode={isDarkMode}
          />

          {/* Maintenance List */}
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold">Maintenance Items</h2>
            <MaintenanceList
              apiUrl="/api/inventory/maintenance"
              onUpdate={(item) => handleOpenModal(item)}
              refreshTrigger={refreshTrigger}
            />
          </div>

          {/* Leave Applications */}
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold">
              Manager Leave Applications
            </h2>
            <div className="w-full">
              <ManagerLeavePage />
            </div>
          </div>
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold">
              Employee Leave Applications
            </h2>
            <div className="w-full">
              <EmployeeLeavePage />
            </div>
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
      </div>
    </div>
  );
};

export default HomePage;
