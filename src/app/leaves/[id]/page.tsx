"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useUserPermissions } from "@/context/UserPermissionsContext";
import FloatingTooltip from "@/components/FloatingTooltip";

interface ILeave {
  leaveId: string;
  employeeId: string; // employeeId remains a string
  employeeDetails?: { name: string; role?: string } | null; // New field for populated employee details
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  reason: string;
}

export default function LeaveDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [leave, setLeave] = useState<ILeave | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [newStatus, setNewStatus] = useState<string>("");
  const { permissions, loading: permissionsLoading } = useUserPermissions();

  useEffect(() => {
    const fetchLeaveDetails = async () => {
      try {
        const response = await fetch(`/api/leaves/get/${id}`);
        if (!response.ok) throw new Error("Failed to fetch leave details");
        const data = await response.json();
        setLeave(data);
        setNewStatus(data.status);
      } catch (error) {
        console.error("Error fetching leave details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveDetails();
  }, [id]);

  const handleUpdateStatus = async () => {
    try {
      const response = await fetch(`/api/leaves/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update leave status");
      toast.success("Leave status updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update leave status.");
    }
  };

  const canApproveLeave =
    permissions.includes("admin") ||
    permissions.includes("project_manager") ||
    permissions.includes("hr_manager") ||
    permissions.includes("hr_team") ||
    permissions.includes("can_access_manager_leave_page") ||
    permissions.includes("can_approve_leave");

  if (loading || !leave)
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-gray-600">Loading leave details...</p>
      </div>
    );

  return (
    <div className="mx-auto mt-10 max-w-5xl rounded-lg bg-white p-10 px-20 shadow-md">
      <h1 className="mb-6 border-b pb-2 text-3xl font-bold text-gray-800">
        Leave Application Details
      </h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-gray-500">Leave ID</p>
          <p className="text-lg font-medium text-gray-800">{leave.leaveId}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Employee ID</p>
          <p className="text-lg font-medium text-gray-800">
            {leave.employeeId}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Employee Name</p>
          <p className="text-lg font-medium text-gray-800">
            {leave.employeeDetails?.name || "N/A"}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Leave Type</p>
          <p className="text-lg font-medium text-gray-800">{leave.leaveType}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Status</p>
          <p className="text-lg font-medium text-gray-800">{leave.status}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Start Date</p>
          <p className="text-lg font-medium text-gray-800">{leave.startDate}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">End Date</p>
          <p className="text-lg font-medium text-gray-800">{leave.endDate}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm font-semibold text-gray-500">Reason</p>
          <p className="text-lg font-medium text-gray-800">{leave.reason}</p>
        </div>
      </div>

      {/* Update Status Section */}
      <div className="mt-8 border-t pt-6">
        <label
          htmlFor="status"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Update Status
        </label>
        <div className="flex items-center gap-4">
          {!canApproveLeave ? (
            <div className="flex w-full items-center gap-4">
              <FloatingTooltip
                width="200px"
                message={`Permission Required to Update Status (Current: ${newStatus})`}
              >
                {" "}
                <select
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-gray-100 p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed md:w-1/2"
                  disabled
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </FloatingTooltip>
              <FloatingTooltip message="Permission Required to Update Status">
                <button
                  className="cursor-not-allowed rounded-md bg-gray-300 px-4 py-2 text-gray-500 transition-all"
                  disabled
                >
                  Update Status
                </button>
              </FloatingTooltip>
            </div>
          ) : (
            <div className="flex w-full items-center gap-4">
              <select
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-1/2"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <button
                onClick={handleUpdateStatus}
                className="rounded-md bg-blue-500 px-4 py-2 text-white transition-all hover:bg-blue-600"
              >
                Update Status
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
