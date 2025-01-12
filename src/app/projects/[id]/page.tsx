// src\app\projects\[id]\page.tsx

"use client";

import React, { useState } from "react";
import ProjectHeader from "@/app/projects/ProjectHeader";
import BoardView from "../BoardView";
import ListView from "../ListView";
import TimelineView from "../TimelineView";
import TableView from "../TableView";
import ModalNewTask from "@/components/ModalNewTask";
import { useParams } from "next/navigation"; // Use Next.js hook for params

const ProjectPage = () => {
  const params = useParams(); // Retrieve params from the URL
  const id = params ? params.id : null; // Extract project ID from params
  const [activeTab, setActiveTab] = useState("Board"); // Manage active tab
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false); // Manage task modal

  // Ensure `id` is a string
  const projectId = Array.isArray(id) ? id[0] : id;

  if (!projectId) {
    return <div>Project ID is required.</div>;
  }

  return (
    <div>
      {/* Modal for Adding New Task */}
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
        projectId={projectId} // Pass project ID for task creation
      />

      {/* Project Header with Tabs */}
      <ProjectHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projectId={projectId} // Pass projectId to ProjectHeader
        refreshProjectList={() => {}} // Pass a dummy function or implement the actual function
      />
      {/* Conditional Rendering of Tabs */}
      {activeTab === "Board" && (
        <BoardView
          id={projectId}
          setIsModalNewTaskOpen={setIsModalNewTaskOpen}
        />
      )}
      {activeTab === "List" && (
        <ListView
          id={projectId}
          setIsModalNewTaskOpen={setIsModalNewTaskOpen}
        />
      )}
      {activeTab === "Timeline" && (
        <TimelineView
          id={projectId}
          setIsModalNewTaskOpen={setIsModalNewTaskOpen}
        />
      )}
      {activeTab === "Table" && (
        <TableView
          id={projectId}
          setIsModalNewTaskOpen={setIsModalNewTaskOpen}
        />
      )}
    </div>
  );
};

export default ProjectPage;
