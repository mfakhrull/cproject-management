"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { IMaterialRequest } from "@/types";
import { toast } from "sonner";

interface RequestMaterialDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialRequest: IMaterialRequest | null;
  onUpdate: (updatedRequest: IMaterialRequest) => void; // Callback to update request
}

const RequestMaterialDetailsModal: React.FC<RequestMaterialDetailsModalProps> = ({
  isOpen,
  onClose,
  materialRequest,
  onUpdate,
}) => {
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
    value: any
  ) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    setItems([...items, { name: "", quantity: 0, priority: "LOW" }]);
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
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Material Request Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          {/* Items Section */}
          <div>
            <h3 className="text-lg font-semibold">Items</h3>
            {items.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, "name", e.target.value)}
                  className="flex-1 px-2 py-1 border rounded"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, "quantity", +e.target.value)}
                  className="w-20 px-2 py-1 border rounded"
                />
                <select
                  value={item.priority}
                  onChange={(e) => handleItemChange(index, "priority", e.target.value as "LOW" | "MEDIUM" | "HIGH")}
                  className="w-24 px-2 py-1 border rounded"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={handleAddItem}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Item
            </button>
          </div>

          {/* Status Section */}
          <div>
            <label className="block text-gray-700 font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "PENDING" | "APPROVED" | "REVISION_REQUIRED")}
              className="w-full px-4 py-2 border rounded-md focus:outline-none"
            >
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REVISION_REQUIRED">Revision Required</option>
            </select>
          </div>

          {/* Notes Section */}
          <div>
            <label className="block text-gray-700 font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={handleResubmit}
            className={`px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 ${
              status !== "REVISION_REQUIRED" ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={status !== "REVISION_REQUIRED"}
          >
            Resubmit
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestMaterialDetailsModal;
