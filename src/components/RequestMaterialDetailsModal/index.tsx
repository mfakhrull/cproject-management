"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { IMaterialRequest } from "@/types";
import { toast } from "sonner";
import FloatingTooltip from "@/components/FloatingTooltip"; // Import your tooltip component
import { useUserPermissions } from "@/context/UserPermissionsContext"; // Import the permissions hook

interface RequestMaterialDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialRequest: IMaterialRequest | null;
  onUpdate: (updatedRequest: IMaterialRequest) => void; // Callback to update request
}

const RequestMaterialDetailsModal: React.FC<
  RequestMaterialDetailsModalProps
> = ({ isOpen, onClose, materialRequest, onUpdate }) => {
  const { permissions } = useUserPermissions(); // Get user permissions
  const canRequestMaterial =
    permissions.includes("inventory_manager") ||
    permissions.includes("can_request_material") || // Permission check
    permissions.includes("admin") ||
    permissions.includes("project_manager");

  const [items, setItems] = useState<IMaterialRequest["items"]>([]);
  const [status, setStatus] = useState<IMaterialRequest["status"]>("PENDING");
  const [notes, setNotes] = useState<string>("");

  // Sync modal state with the current `materialRequest`
  useEffect(() => {
    if (materialRequest) {
      setItems(materialRequest.items || []);
      setStatus(materialRequest.status || "PENDING");
      setNotes(materialRequest.notes || "");
    }
  }, [materialRequest]);

  if (!isOpen || !materialRequest) return null;

  const handleItemChange = (
    index: number,
    field: keyof IMaterialRequest["items"][number],
    value: any,
  ) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    toast("Adding an item will set status to PENDING. Proceed?", {
      action: {
        label: "Yes, Add Item",
        onClick: () => {
          setItems([...items, { name: "", quantity: 0, priority: "LOW" }]);

          if (status !== "PENDING") {
            setStatus("PENDING");
            toast.success("Status updated to PENDING due to item addition.");
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {
          toast("Action canceled.", { duration: 3000 });
        },
      },
      duration: 5000, // Optional: Duration for the toast to remain visible
    });
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const handleSave = () => {
    const updatedRequest: IMaterialRequest = {
      ...materialRequest,
      items,
      status,
      notes,
    };
    onUpdate(updatedRequest); // Callback to save changes
    toast.success("Changes saved successfully!");
    onClose();
  };

  const handleResubmit = () => {
    if (status === "REVISION_REQUIRED") {
      setStatus("PENDING");
      toast.success("Request status updated to PENDING.");
    } else {
      toast.error("Request is not in REVISION_REQUIRED status.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Material Request Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-4">
          {/* Items Section */}
          <div>
            <h3 className="text-lg font-semibold">Items</h3>
            {items.map((item, index) => (
              <div key={index} className="mb-2 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={item.name}
                  onChange={(e) =>
                    handleItemChange(index, "name", e.target.value)
                  }
                  className="flex-1 rounded border px-2 py-1"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", +e.target.value)
                  }
                  className="w-20 rounded border px-2 py-1"
                />
                <select
                  value={item.priority}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "priority",
                      e.target.value as "LOW" | "MEDIUM" | "HIGH",
                    )
                  }
                  className="w-24 rounded border px-2 py-1"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                {!canRequestMaterial ? (
                  <FloatingTooltip message="Permission Required">
                    <button
                      disabled
                      className="cursor-not-allowed text-red-300"
                    >
                      Remove
                    </button>
                  </FloatingTooltip>
                ) : (
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {!canRequestMaterial ? (
              <FloatingTooltip message="Permission Required">
                <button
                  onClick={handleAddItem}
                  disabled
                  className="mt-2 cursor-not-allowed rounded bg-gray-200 px-3 py-1 text-gray-400"
                >
                  Add Item
                </button>
              </FloatingTooltip>
            ) : (
              <button
                onClick={handleAddItem}
                className="mt-2 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
              >
                Add Item
              </button>
            )}
          </div>

          {/* Status Section */}
          <div>
            <label className="block font-medium text-gray-700">Status</label>
            {!canRequestMaterial ? (
              <FloatingTooltip message="Permission Required">
                <select
                  value={status}
                  disabled
                  className="w-full cursor-not-allowed rounded-md border bg-gray-200 px-4 py-2 text-gray-400 focus:outline-none"
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REVISION_REQUIRED">Revision Required</option>
                </select>
              </FloatingTooltip>
            ) : (
              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as
                      | "PENDING"
                      | "APPROVED"
                      | "REVISION_REQUIRED",
                  )
                }
                className="w-full rounded-md border px-4 py-2 focus:outline-none"
              >
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REVISION_REQUIRED">Revision Required</option>
              </select>
            )}
          </div>

          {/* Notes Section */}
          <div>
            <label className="block font-medium text-gray-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border px-4 py-14 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={handleResubmit}
            className={`rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 ${
              status !== "REVISION_REQUIRED"
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
            disabled={status !== "REVISION_REQUIRED"}
          >
            Resubmit
          </button>
          {!canRequestMaterial ? (
            <FloatingTooltip message="Permission Required">
              <button
                disabled
                className="cursor-not-allowed rounded bg-gray-300 px-4 py-2 text-gray-500"
              >
                Save Changes
              </button>
            </FloatingTooltip>
          ) : (
            <button
              onClick={handleSave}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestMaterialDetailsModal;
