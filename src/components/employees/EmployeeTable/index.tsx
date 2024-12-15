"use client";

import { IEmployee } from "@/models/Employee";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";

interface EmployeeTableProps {
  employees: IEmployee[];
}

export const EmployeeTable = ({ employees }: EmployeeTableProps) => {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/employees/deleteemployee`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete employee.");
      }

      toast.success("Employee deleted successfully!");
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Failed to delete employee.");
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/employees/${id}`);
  };

  const rows = employees.map((employee) => ({
    id: employee._id,
    employeeId: employee.employeeId,
    name: employee.name,
    role: employee.role,
    email: employee.contact.email,
  }));

  const columns: GridColDef[] = [
    { field: "employeeId", headerName: "Employee ID", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
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
      <DataGrid
        rows={rows}
        columns={columns}
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
  );
};
