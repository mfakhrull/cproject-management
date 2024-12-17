"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";

interface Project {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
  managerName: string; // Replace managerId object with managerName string
}

export default function ProjectHistoryPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Fetch completed projects
  useEffect(() => {
    const fetchCompletedProjects = async () => {
      try {
        const response = await fetch("/api/projects/completed");
        if (!response.ok) throw new Error("Failed to fetch projects.");
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Error fetching projects.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedProjects();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch("/api/projects/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete project.");
      setProjects(projects.filter((project) => project._id !== id));
      toast.success("Project deleted successfully!");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Error deleting project.");
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/projects/${id}/details`);
  };

  const rows = projects.map((project) => ({
    id: project._id,
    name: project.name,
    description: project.description,
    startDate: new Date(project.startDate).toLocaleDateString(),
    endDate: new Date(project.endDate).toLocaleDateString(),
    location: project.location,
    status: project.status,
    managerName: project.managerName || "N/A", // Use managerName from API
}));

  const columns: GridColDef[] = [
    { field: "name", headerName: "Project Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    { field: "startDate", headerName: "Start Date", flex: 1 },
    { field: "endDate", headerName: "End Date", flex: 1 },
    { field: "location", headerName: "Location", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "managerName", headerName: "Manager", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<InfoIcon color="primary" />}
          label="Details"
          onClick={() => handleViewDetails(params.id as string)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<DeleteIcon color="error" />}
          label="Delete"
          onClick={() => handleDelete(params.id as string)}
          showInMenu
        />,
      ],
    },
  ];

  return (
    <div className="container mx-auto mt-6 p-6">
      <div className="container mx-auto mb-2 flex items-center rounded-lg bg-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Completed Projects</h1>
      </div>
      <div className="rounded-lg bg-white p-4 shadow-md">
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          initialState={{
            pagination: { paginationModel: { pageSize: 5, page: 0 } },
          }}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          className="h-[500px]"
        />
      </div>
    </div>
  );
}
