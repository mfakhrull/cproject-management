"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Home,
  LayoutDashboard,
  Layers3,
  Lock,
  Menu,
  Drill,
  Search,
  Settings,
  ShieldAlert,
  User,
  Users,
  History,
  X,
  Files,
  FileChartPie,
  PlusSquare,
} from "lucide-react";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, UserButton, SignedOut, SignInButton } from "@clerk/nextjs";
import { useAppDispatch, useAppSelector } from "@/app/redux/redux";
import { setIsSidebarCollapsed } from "@/app/state";
import { useUserPermissions } from "@/context/UserPermissionsContext";
import FloatingTooltip from "@/components/FloatingTooltip";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import ModalNewProject from "@/app/projects/ModalNewProject";


interface Project {
  _id: string;
  name: string;
  status: "PLANNING" | "IN_PROGRESS" | "COMPLETED"; // Type the status properly
}

const Sidebar: React.FC = () => {
  const [showProjects, setShowProjects] = useState(true);
  const [showPriority, setShowPriority] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    employeeId,
    permissions,
    role,
    loading: permissionsLoading,
  } = useUserPermissions();
  const { user } = useUser();
  const username = user?.username;

  const [isModalNewProjectOpen, setIsModalNewProjectOpen] = useState(false);
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const [refreshProjects, setRefreshProjects] = useState(0); // Use this to trigger re-fetching
  const refreshProjectsFromUpdates = useAppSelector(
    (state) => state.global.refreshProjects,
  ); // Listen for project refresh changes

  const sidebarClassNames = `fixed flex flex-col h-[100%] justify-between shadow-xl
    transition-all duration-300 h-full z-40 dark:bg-black overflow-y-auto bg-white ${
      isSidebarCollapsed ? "w-0 hidden" : "w-64"
    }`;

    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          permissions: JSON.stringify(permissions),
          employeeId: employeeId || "",
        };
  
        const response = await fetch("/api/projects/read", {
          method: "GET",
          headers,
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch projects");
        }
  
        const data: Project[] = await response.json();
        setProjects(data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching projects:", err);
        setError(err.message);
        toast.error("Failed to load projects");
      } finally {
        setIsLoadingProjects(false);
      }
    };
  
    useEffect(() => {
      if (permissions && employeeId) {
        fetchProjects();
      }
    }, [refreshProjects, refreshProjectsFromUpdates, permissions, employeeId]);
  
    // Function to trigger a manual refresh
    const refreshProjectList = () => {
      setRefreshProjects((prev) => prev + 1);
    };

  const canAccessContractAnalysis =
    permissions.includes("admin") ||
    permissions.includes("project_manager") ||
    permissions.includes("procurement_team") ||
    permissions.includes("can_access_contract_analysis");

  const canCreateProject =
    permissions.includes("can_create_project") ||
    permissions.includes("admin") ||
    permissions.includes("project_manager");

  return (
    <div className={sidebarClassNames}>
      <div className="flex h-[100%] w-full flex-col justify-start">
        {/* TOP LOGO */}
        <div className="z-50 flex min-h-[56px] w-full items-center justify-between bg-white px-4 pt-3 dark:bg-black">
          <div className="text-xl font-bold text-gray-800 dark:text-white">
            ICMS
          </div>
          <button
            className="py-3"
            onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
          >
            {isSidebarCollapsed ? (
              <Menu className="h-6 w-6 text-gray-800 hover:text-gray-500 dark:text-white" />
            ) : (
              <X className="h-6 w-6 text-gray-800 hover:text-gray-500 dark:text-white" />
            )}
          </button>
        </div>

        {/* TEAM */}
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-5 border-y-[1.5px] border-gray-200 px-8 py-4 dark:border-gray-700">
            <Image
              src="https://res.cloudinary.com/dftpdqp65/image/upload/v1736444341/Final_Logo_Nexion_tyrfrc.png" // Placeholder for logo - update as needed
              alt="Logo"
              width={60}
              height={40}
            />
            <div>
              <h3 className="text-md font-bold tracking-wide dark:text-gray-200">
                {username}
              </h3>
              <div className="mt-1 flex items-start gap-2">
                <Lock className="mt-[0.1rem] h-3 w-3 text-gray-500 dark:text-gray-400" />
                <p className="text-xs text-gray-500">{role}</p>
              </div>
            </div>
          </div>
        )}

        {/* NAVBAR LINKS */}
        <nav className="z-10 w-full">
          <SidebarLink
            icon={LayoutDashboard}
            label="Dashboard"
            href="/"
            isCollapsed={isSidebarCollapsed}
          />
          <SidebarLink
            icon={Briefcase}
            label="Timeline"
            href="/timeline"
            isCollapsed={isSidebarCollapsed}
          />
          {/* <SidebarLink
            icon={Search}
            label="Search"
            href="/search"
            isCollapsed={isSidebarCollapsed}
          />
          <SidebarLink
            icon={Settings}
            label="Settings"
            href="/settings"
            isCollapsed={isSidebarCollapsed}
          /> */}

          <SidebarLink
            icon={Drill}
            label="Inventory"
            href="/inventory"
            isCollapsed={isSidebarCollapsed}
          />
          <SidebarLink
            icon={PrecisionManufacturingOutlinedIcon}
            label="Supplier Management"
            href="/inventory/suppliers"
            isCollapsed={isSidebarCollapsed}
          />
          <SidebarLink
            icon={Files}
            label="Opportunities"
            href="/documents"
            isCollapsed={isSidebarCollapsed}
          />

          {!canAccessContractAnalysis ? (
            <FloatingTooltip message="Permission Required">
              <div
                className={`relative flex cursor-not-allowed items-center gap-3 px-8 py-3 text-gray-400 transition-colors ${
                  isSidebarCollapsed ? "justify-center" : "justify-start"
                }`}
              >
                <FileChartPie className="h-6 w-6 text-gray-400" />
                {!isSidebarCollapsed && (
                  <span className="font-medium">Contract Analysis</span>
                )}
              </div>
            </FloatingTooltip>
          ) : (
            <SidebarLink
              icon={FileChartPie}
              label="Contract Analysis"
              href="/dashboard"
              isCollapsed={isSidebarCollapsed}
            />
          )}

          <SidebarLink
            icon={Users}
            label="Employee Management"
            href="/employees"
            isCollapsed={isSidebarCollapsed}
          />
        </nav>

        {/* PROJECTS LINKS */}
        <button
          onClick={() => setShowProjects((prev) => !prev)}
          className="mt-2 flex w-full items-center justify-between px-8 py-3 text-gray-500"
        >
          <span>Projects</span>
          {showProjects ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
        {showProjects && (
          <div>
            {/* New Project Button */}
            {canCreateProject ? (
              <button
                className="mx-8 my-2 flex w-48 items-center justify-center rounded-md bg-gray-200/60 px-3 py-2 text-gray-700 font-medium hover:bg-gray-300"
                onClick={() => setIsModalNewProjectOpen(true)}
              >
                <PlusSquare className="mr-2 h-5 w-5" />
                New Project
              </button>
            ) : (
              <FloatingTooltip message="Permission Required">
                <button
                  className="mx-8 my-2 flex w-full cursor-not-allowed items-center justify-center rounded-md bg-gray-200 px-3 py-2 text-gray-400"
                  disabled
                >
                  <PlusSquare className="mr-2 h-5 w-5" />
                  New Project
                </button>
              </FloatingTooltip>
            )}

            {isLoadingProjects ? (
              <p className="text-gray-500">Loading projects...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              projects.map((project) => (
                <SidebarLink
                  key={project._id}
                  icon={Briefcase}
                  label={project.name}
                  href={`/projects/${project._id}`}
                  isCollapsed={isSidebarCollapsed}
                />
              ))
            )}
            <div className="mx-6 my-2 mb-4 border-b border-gray-800/10"></div>
          </div>
        )}

        {/* Modal for Adding a New Project */}
        <ModalNewProject
          isOpen={isModalNewProjectOpen}
          onClose={() => setIsModalNewProjectOpen(false)}
          onProjectAdded={refreshProjectList} // Call refreshProjectList after adding a project
        />

        <nav>
          
          {/* <SidebarLink
            icon={User}
            label="Users"
            href="/users"
            isCollapsed={isSidebarCollapsed}
          />
          <SidebarLink
            icon={Users}
            label="Teams"
            href="/teams"
            isCollapsed={isSidebarCollapsed}
          /> */}
        </nav>

        {/* PRIORITIES LINKS */}
        <button
          onClick={() => setShowPriority((prev) => !prev)}
          className="flex w-full items-center justify-between px-8 py-3 text-gray-500"
        >
          <span>Priority</span>
          {showPriority ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
        {showPriority && (
          <>
            <SidebarLink
              icon={AlertCircle}
              label="Urgent"
              href="/priority/urgent"
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarLink
              icon={ShieldAlert}
              label="High"
              href="/priority/high"
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarLink
              icon={AlertTriangle}
              label="Medium"
              href="/priority/medium"
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarLink
              icon={AlertOctagon}
              label="Low"
              href="/priority/low"
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarLink
              icon={Layers3}
              label="Backlog"
              href="/priority/backlog"
              isCollapsed={isSidebarCollapsed}
            />
          </>
        )}
        <div>
          <hr className="my-2 h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
        </div>
        <nav>
        <SidebarLink
            icon={User}
            label="My Profile"
            href="/employees/me"
            isCollapsed={isSidebarCollapsed}
          />
          <SidebarLink
            icon={History}
            label="History"
            href="/projects/history"
            isCollapsed={isSidebarCollapsed}
          />
        </nav>
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  href: string;
  icon: React.ComponentType<any>;
  label: string;
  isCollapsed: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  href,
  icon: Icon,
  label,
  isCollapsed,
}) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (pathname === "/" && href === "/dashboard1");

  return (
    <Link href={href} className="w-full">
      <div
        className={`relative flex cursor-pointer items-center gap-3 transition-colors hover:bg-gray-100 dark:bg-black dark:hover:bg-gray-700 ${
          isActive ? "bg-gray-100 text-white dark:bg-gray-600" : ""
        } justify-start px-8 py-3 ${isCollapsed ? "justify-center" : ""}`}
      >
        {isActive && !isCollapsed && (
          <div className="absolute left-0 top-0 h-full w-[5px] bg-blue-200" />
        )}

        <Icon className={`h-6 w-6 text-gray-800 dark:text-gray-100`} />
        {!isCollapsed && (
          <span className={`font-medium text-gray-800 dark:text-gray-100`}>
            {label}
          </span>
        )}
      </div>
    </Link>
  );
};

export default Sidebar;
