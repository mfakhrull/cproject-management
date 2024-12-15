"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

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

  if (loading || !leave)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Loading leave details...</p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto mt-10 p-10 px-20 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
        Leave Application Details
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500 font-semibold">Leave ID</p>
          <p className="text-lg font-medium text-gray-800">{leave.leaveId}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 font-semibold">Employee ID</p>
          <p className="text-lg font-medium text-gray-800">{leave.employeeId}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 font-semibold">Employee Name</p>
          <p className="text-lg font-medium text-gray-800">
          {leave.employeeDetails?.name || "N/A"}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 font-semibold">Leave Type</p>
          <p className="text-lg font-medium text-gray-800">{leave.leaveType}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 font-semibold">Status</p>
          <p className="text-lg font-medium text-gray-800">{leave.status}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 font-semibold">Start Date</p>
          <p className="text-lg font-medium text-gray-800">{leave.startDate}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 font-semibold">End Date</p>
          <p className="text-lg font-medium text-gray-800">{leave.endDate}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm text-gray-500 font-semibold">Reason</p>
          <p className="text-lg font-medium text-gray-800">{leave.reason}</p>
        </div>
      </div>

      {/* Update Status Section */}
      <div className="mt-8 border-t pt-6">
        <label
          htmlFor="status"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Update Status
        </label>
        <div className="flex items-center gap-4">
          <select
            id="status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full md:w-1/2 rounded-md border border-gray-300 p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button
            onClick={handleUpdateStatus}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-all"
          >
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
}
