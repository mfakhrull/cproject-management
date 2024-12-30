"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { toast } from "sonner";
import { useUserPermissions } from "@/context/UserPermissionsContext"; // Updated to use employeeId
import { useRouter } from "next/navigation";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";

interface ILeave {
  _id: string;
  leaveId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function EmployeeLeavePage() {
  const [leaves, setLeaves] = useState<ILeave[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { employeeId } = useUserPermissions(); // Use employeeId from context
  const router = useRouter();

  useEffect(() => {
    const fetchEmployeeLeaves = async () => {
      if (!employeeId) return;

      try {
        const response = await fetch(`/api/leaves/get?employeeId=${employeeId}`);
        if (!response.ok) throw new Error("Failed to fetch leave applications.");
        const data = await response.json();
        setLeaves(data);
      } catch (error) {
        console.error("Error fetching leave applications:", error);
        toast.error("Error fetching leave applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeLeaves();
  }, [employeeId]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/leaves/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete leave application.");
      setLeaves(leaves.filter((leave) => leave._id !== id));
      toast.success("Leave application deleted successfully!");
    } catch (error) {
      console.error("Error deleting leave application:", error);
      toast.error("Failed to delete leave application.");
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/leaves/${id}`);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-MY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const rows = leaves.map((leave) => ({
    id: leave._id,
    leaveId: leave.leaveId,
    leaveType: leave.leaveType,
    startDate: formatDate(leave.startDate),
    endDate: formatDate(leave.endDate),
    status: leave.status,
  }));

  const columns: GridColDef[] = [
    { field: "leaveId", headerName: "Leave ID", flex: 1 },
    { field: "leaveType", headerName: "Leave Type", flex: 1 },
    { field: "startDate", headerName: "Start Date", flex: 1 },
    { field: "endDate", headerName: "End Date", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
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
    <div className="flex-grow overflow-hidden rounded-lg bg-white p-4 shadow-md">
      <h1 className="text-2xl font-bold mb-4 ms-20">My Leave Applications</h1>
      <div className="rounded-lg bg-white p-4 shadow-md mx-20">
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
                page: 0,
              },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          className="h-96"
        />
      </div>
    </div>
  );
}
