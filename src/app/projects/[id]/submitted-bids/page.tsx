"use client";

import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import ApproveIcon from "@mui/icons-material/CheckCircle";
import RejectIcon from "@mui/icons-material/Cancel";
import DetailsIcon from "@mui/icons-material/Info";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowId,
} from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { useUserPermissions } from "@/context/UserPermissionsContext";
import FloatingTooltip from "@/components/FloatingTooltip";
import { Info } from "lucide-react";

export default function SubmittedBidsPage() {
  const router = useRouter();

  const { id } = useParams() as { id: string };
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useAuth();
  const projectId = Array.isArray(id) ? id[0] : id;
  const { permissions, loading: permissionsLoading } = useUserPermissions();

  useEffect(() => {
    if (!projectId) {
      toast.error("Project ID is missing");
      router.push("/projects");
      return;
    }

    async function fetchBids() {
      try {
        const response = await fetch(`/api/bids?projectId=${projectId}&userId=${userId}`);
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch submitted bids");
        }
        console.log("Fetched Bids:", result.bids); // Debugging
        setBids(result.bids);
      } catch (error) {
        console.error("Error fetching submitted bids:", error);
        toast.error("Failed to fetch submitted bids");
      } finally {
        setLoading(false);
      }
    }

    fetchBids();
  }, [projectId, userId, permissions]);

  const handleUpdateStatus =
    (id: GridRowId, status: "APPROVED" | "REJECTED", documentId: string) =>
    async () => {
      try {
        const response = await fetch(`/api/bids/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, documentId }),
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to update status");
        }

        toast.success(`Bid status updated to ${status}`);
        setBids((prevBids) =>
          prevBids.map((bid) => (bid._id === id ? { ...bid, status } : bid)),
        );
      } catch (error) {
        console.error("Error updating bid status:", error);
        toast.error(
          error instanceof Error ? error.message : "Error updating status",
        );
      }
    };

  const handleDeleteBid = (bidId: GridRowId) => async () => {
    try {
      const response = await fetch(`/api/bids/${bidId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete bid");
      }

      toast.success("Bid deleted successfully!");
      setBids((prevBids) => prevBids.filter((bid) => bid._id !== bidId));
    } catch (error) {
      console.error("Error deleting bid:", error);
      toast.error("Failed to delete bid");
    }
  };

  const rows = bids.map((bid) => ({
    id: bid._id,
    contractorName: bid.contractorName,
    price: bid.price, // Should now be a proper number
    timeline: bid.timeline,
    status: bid.status,
    attachments: bid.attachments,
    documentId: bid.documentId, // Include the documentId
  }));

  const columns: GridColDef[] = [
    { field: "contractorName", headerName: "Contractor", flex: 1 },
    { field: "price", headerName: "Price", type: "number", flex: 1 },
    { field: "timeline", headerName: "Timeline", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "attachments",
      headerName: "Attachments",
      flex: 2,
      renderCell: (params) =>
        params.value.map((attachment: any, index: number) => (
          <div key={index}>
            <a
              href={attachment.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {attachment.fileName}
            </a>
          </div>
        )),
    },
    {
      field: "actions",
      type: "actions",
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<DetailsIcon />}
          label="Details"
          onClick={() =>
            router.push(`/projects/${projectId}/submitted-bids/${params.id}`)
          }
          showInMenu
        />,
        <GridActionsCellItem
          icon={<DeleteIcon color="error" />}
          label="Delete"
          onClick={handleDeleteBid(params.id)}
          showInMenu
        />,
      ],
    },
  ];

  if (permissionsLoading) {
    return <p className="mt-4 text-center">Checking permissions...</p>;
  }

  if (loading) {
    return <p className="mt-4 text-center">Loading...</p>;
  }

  const canViewAllBids =
    permissions.includes("admin") ||
    permissions.includes("project_manager") ||
    permissions.includes("procurement_team") ||
    permissions.includes("can_see_all_submitted_bid");

  return (
    <div className="container mx-auto flex flex-col gap-4 p-4">
      <div className="flex items-center gap-4 py-2">
        <h1 className="text-2xl font-bold">Submitted Bids</h1>
        {canViewAllBids ? (
          <FloatingTooltip width="200px" message="You are viewing all submitted bids for this project.">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
              <Info className="h-5 w-5 cursor-pointer text-slate-800/40 hover:text-slate-800" />
            </div>
          </FloatingTooltip>
        ) : (
          <FloatingTooltip width="200px" message="You are limited to viewing only your own submitted bids unless you have the necessary permissions.">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
              <Info className="h-5 w-5 cursor-pointer text-slate-800/40 hover:text-slate-800" />
            </div>
          </FloatingTooltip>
        )}
      </div>

      {bids.length === 0 ? (
        <p>No bids submitted for this project.</p>
      ) : (
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
            className="h-full"
          />
        </div>
      )}
    </div>
  );
}
