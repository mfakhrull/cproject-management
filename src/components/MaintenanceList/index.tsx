"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from "@mui/icons-material/Edit";
import FloatingTooltip from "../FloatingTooltip";
import TaskStatusChart from "@/components/TaskStatusChart"; // Import the status chart component
import { Info } from "lucide-react";

interface MaintenanceItem {
  specificItemId: string;
  maintenanceSchedule: string;
  location: string;
  status: string;
  maintenanceType?: string[];
  parentItemName: string;
  parentItemId: string; // Add parentItemId for navigation
}

interface MaintenanceListProps {
  apiUrl: string;
  onUpdate: (item: MaintenanceItem) => void; // Callback for update action
  refreshTrigger: number; // Prop to trigger re-fetching
}

const MaintenanceList: React.FC<MaintenanceListProps> = ({
  apiUrl,
  onUpdate,
  refreshTrigger,
}) => {
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch data.");
        const data = await response.json();
        setItems(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, refreshTrigger]);

  // Calculate status distribution for the chart
  const statusCount = items.reduce(
    (acc: Record<string, number>, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    { Overdue: 0, Pending: 0 },
  );

  const statusDistribution = Object.keys(statusCount).map((key) => ({
    name: key,
    count: statusCount[key],
  }));

  const rows = items.map((item, index) => ({
    id: index,
    specificItemId: item.specificItemId,
    parentItemName: item.parentItemName,
    parentItemId: item.parentItemId,
    maintenanceSchedule: new Intl.DateTimeFormat("en-MY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(item.maintenanceSchedule)),
    daysRemaining: Math.ceil(
      (new Date(item.maintenanceSchedule).getTime() - new Date().getTime()) /
        (1000 * 3600 * 24),
    ),
    location: item.location,
    status: item.status,
    maintenanceType: item.maintenanceType?.join(", ") || "N/A",
  }));

  const columns: GridColDef[] = [
    { field: "specificItemId", headerName: "Item Name", flex: 1 },
    { field: "parentItemName", headerName: "Parent Item", flex: 1 },
    {
      field: "maintenanceSchedule",
      headerName: "Maintenance Due Date",
      flex: 1,
    },
    { field: "daysRemaining", headerName: "Days Remaining", flex: 1 },
    { field: "location", headerName: "Location", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        let bgColor = "";
        let textColor = "";

        if (params.value === "Pending") {
          bgColor = "bg-yellow-100";
          textColor = "text-yellow-800";
        } else if (params.value === "Overdue") {
          bgColor = "bg-red-100";
          textColor = "text-red-800";
        } else {
          bgColor = "bg-green-100";
          textColor = "text-green-800";
        }

        return (
          <span
            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${bgColor} ${textColor}`}
          >
            {params.value}
          </span>
        );
      },
    },
    { field: "maintenanceType", headerName: "Maintenance Type", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<InfoIcon color="primary" />}
          label="Details"
          onClick={() => router.push(`/inventory/${params.row.parentItemId}`)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<EditIcon color="secondary" />}
          label="Update Maintenance Date"
          onClick={() =>
            onUpdate({
              specificItemId: params.row.specificItemId,
              maintenanceSchedule: params.row.maintenanceSchedule,
              location: params.row.location,
              status: params.row.status,
              parentItemName: params.row.parentItemName,
              maintenanceType: params.row.maintenanceType.split(", "),
              parentItemId: params.row.parentItemId,
            })
          }
          showInMenu
        />,
      ],
    },
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Maintenance List Table */}
      <div className="md:col-span-2">
        <div className="rounded-lg bg-white p-4 shadow-md">
          <div className="mb-4 flex items-center gap-4">
            <h2 className="text-xl font-semibold">Maintenance Items</h2>
            <FloatingTooltip
              width="200px"
              message="You are viewing maintenance items that are overdue or due within the next 30 days."
            >
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
                <Info className="h-5 w-5 cursor-pointer text-slate-800/40 hover:text-slate-800" />
              </div>
            </FloatingTooltip>
          </div>
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
      </div>

      {/* Status Chart */}
      <div>
        <TaskStatusChart
          className="pb-10 pt-5 shadow-md"
          taskStatus={statusDistribution}
          colorMapping={{
            Overdue: "#BE6464", // Custom hex color for Overdue
            Pending: "#AF894D", // Custom hex color for Pending
          }}
          title="Maintenance Status Distribution"
          description="Overview of maintenance distribution by status"
        />
      </div>
    </div>
  );
};

export default MaintenanceList;
