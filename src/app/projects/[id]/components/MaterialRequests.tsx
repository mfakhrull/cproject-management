"use client";

import React from "react";
import { IMaterialRequest } from "@/types";
import { PlusCircle } from "lucide-react";
import FloatingTooltip from "@/components/FloatingTooltip"; // Import your tooltip component
import { useUserPermissions } from "@/context/UserPermissionsContext"; // Import the permissions hook

interface MaterialRequestsProps {
  materialRequests: IMaterialRequest[];
  onOpenDetailsModal: (request: IMaterialRequest) => void;
  onOpenRequestModal: () => void;
}

const MaterialRequests: React.FC<MaterialRequestsProps> = ({
  materialRequests,
  onOpenDetailsModal,
  onOpenRequestModal,
}) => {
  const { permissions } = useUserPermissions(); // Get user permissions
  const canRequestMaterial =
    permissions.includes("inventory_manager") ||
    permissions.includes("can_request_material") || // Permission check
    permissions.includes("admin") ||
    permissions.includes("project_manager");

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">
        Material Requests
      </h2>
      {materialRequests.length ? (
        <ul className="space-y-2">
          {materialRequests.map((request) => (
            <li
              key={request._id}
              className="flex cursor-pointer items-center justify-between rounded-md bg-gray-100 px-4 py-2 hover:bg-gray-200"
              onClick={() => onOpenDetailsModal(request)}
            >
              <span>Request ID: {request._id}</span>
              <span
                className={`capitalize ${
                  request.status === "APPROVED"
                    ? "text-green-500"
                    : request.status === "PENDING"
                      ? "text-yellow-500"
                      : "text-red-500"
                }`}
              >
                {request.status.toLowerCase()}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No material requests submitted.</p>
      )}
      {!canRequestMaterial ? (
        <FloatingTooltip message="Permission Required">
          <button
            onClick={onOpenRequestModal}
            disabled
            className="mt-4 flex cursor-not-allowed items-center rounded-md bg-gray-200 px-4 py-2 text-gray-400"
          >
            <PlusCircle size={20} className="mr-2" />
            Request Material
          </button>
        </FloatingTooltip>
      ) : (
        <button
          onClick={onOpenRequestModal}
          className="mt-4 flex items-center rounded-md bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
        >
          <PlusCircle size={20} className="mr-2" />
          Request Material
        </button>
      )}
    </div>
  );
};

export default MaterialRequests;
