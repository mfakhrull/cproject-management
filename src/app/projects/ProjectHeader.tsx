// src\app\projects\ProjectHeader.tsx
"use client";

import Header from "@/components/Header";
import Link from "next/link";
import {
  Clock,
  Filter,
  Grid3x3,
  List,
  PlusSquare,
  Share2,
  Table,
  FileText,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import ModalNewProject from "./ModalNewProject";
import { useUserPermissions } from "@/context/UserPermissionsContext"; // Import the hook
import FloatingTooltip from "@/components/FloatingTooltip"; // Import your tooltip component

type Props = {
  activeTab: string;
  setActiveTab: (tabName: string) => void;
  projectId: string; // Pass the current project ID to link to the details page
};

const ProjectHeader = ({ activeTab, setActiveTab, projectId }: Props) => {
  const { permissions } = useUserPermissions(); // Get user permissions
  const canCreateProject =
    permissions.includes("can_create_project") || // Permission check
    permissions.includes("admin") ||
    permissions.includes("project_manager");

  const [isModalNewProjectOpen, setIsModalNewProjectOpen] = useState(false);
  const [projectName, setProjectName] = useState<string>("Loading...");

  // Fetch project name
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/details`);
        if (!response.ok) throw new Error("Failed to fetch project details");

        const data = await response.json();
        setProjectName(data.name); // Extract the project name
      } catch (error) {
        console.error("Error fetching project details:", error);
        setProjectName("Project Name Not Found");
      }
    };

    if (projectId) fetchProject();
  }, [projectId]);

  // Disable button logic
  const isButtonDisabled =
    !permissions.includes("admin") && !permissions.includes("project_manager");

  return (
    <div className="px-4 xl:px-6">
      <ModalNewProject
        isOpen={isModalNewProjectOpen}
        onClose={() => setIsModalNewProjectOpen(false)}
      />
      <div className="pb-6 pt-6 lg:pb-4 lg:pt-8">
        <Header
          name={projectName} // Dynamic Project Name
          buttonComponent={
            <div className="flex space-x-4">
              {/* New Boards Button */}
              {!canCreateProject ? (
                <FloatingTooltip message="Permission Required">
                  <button
                    className="flex cursor-not-allowed items-center rounded-md bg-gray-200 px-3 py-2 text-gray-400"
                    disabled
                  >
                    <PlusSquare className="mr-2 h-5 w-5" /> New Project
                  </button>
                </FloatingTooltip>
              ) : (
                <button
                  className="flex items-center rounded-md bg-slate-800 px-3 py-2 text-white hover:bg-slate-700"
                  onClick={() => setIsModalNewProjectOpen(true)}
                >
                  <PlusSquare className="mr-2 h-5 w-5" /> New Project
                </button>
              )}

              {/* Link to Project Details */}
              <Link
                href={`/projects/${projectId}/details`}
                className="flex items-center rounded-md bg-slate-800 px-3 py-2 text-white hover:bg-slate-700"
              >
                <FileText className="mr-2 h-5 w-5" /> Project Details
              </Link>
            </div>
          }
        />
      </div>

      {/* TABS */}
      <div className="flex flex-wrap-reverse gap-2 border-y border-gray-200 pb-[8px] pt-2 dark:border-stroke-dark md:items-center">
        <div className="flex flex-1 items-center gap-2 md:gap-4">
          <TabButton
            name="Board"
            icon={<Grid3x3 className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <TabButton
            name="List"
            icon={<List className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <TabButton
            name="Timeline"
            icon={<Clock className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <TabButton
            name="Table"
            icon={<Table className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="text-gray-500 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-gray-300">
            <Filter className="h-5 w-5" />
          </button>
          <button className="text-gray-500 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-gray-300">
            <Share2 className="h-5 w-5" />
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search Task"
              className="rounded-md border py-1 pl-10 pr-4 focus:outline-none dark:border-dark-secondary dark:bg-dark-secondary dark:text-white"
            />
            <Grid3x3 className="absolute left-3 top-2 h-4 w-4 text-gray-400 dark:text-neutral-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

type TabButtonProps = {
  name: string;
  icon: React.ReactNode;
  setActiveTab: (tabName: string) => void;
  activeTab: string;
};

const TabButton = ({ name, icon, setActiveTab, activeTab }: TabButtonProps) => {
  const isActive = activeTab === name;

  return (
    <button
      className={`relative flex items-center gap-2 px-1 py-2 text-gray-500 after:absolute after:-bottom-[9px] after:left-0 after:h-[1px] after:w-full hover:text-blue-600 dark:text-neutral-500 dark:hover:text-white sm:px-2 lg:px-4 ${
        isActive ? "text-blue-600 after:bg-blue-600 dark:text-white" : ""
      }`}
      onClick={() => setActiveTab(name)}
    >
      {icon}
      {name}
    </button>
  );
};

export default ProjectHeader;
