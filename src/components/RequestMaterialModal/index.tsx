"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface RequestMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: {
    items: { name: string; quantity: number; priority: "LOW" | "MEDIUM" | "HIGH" }[];
    notes: string;
  }) => void;
}

const RequestMaterialModal: React.FC<RequestMaterialModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [items, setItems] = useState<
    { name: string; quantity: number | ""; priority: "LOW" | "MEDIUM" | "HIGH" }[]
  >([{ name: "", quantity: "", priority: "MEDIUM" }]);
  const [notes, setNotes] = useState("");

  const handleAddItem = () => {
    setItems([...items, { name: "", quantity: "", priority: "MEDIUM" }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setItems(
      items.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === "quantity" ? (value === "" ? "" : Number(value)) : value,
            }
          : item
      )
    );
  };

  const handleSubmit = () => {
    const hasInvalidItem = items.some(
      (item) => !item.name || !item.quantity || item.quantity <= 0
    );

    if (hasInvalidItem) {
      alert("Please provide valid details for all items!");
      return;
    }

    onSubmit({
      items: items.map((item) => ({
        name: item.name,
        quantity: Number(item.quantity),
        priority: item.priority,
      })),
      notes,
    });

    // Clear the form and close the modal
    setItems([{ name: "", quantity: "", priority: "MEDIUM" }]);
    setNotes("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Request New Material</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-md p-4 space-y-4"
            >
              <div>
                <label className="block text-gray-700 font-medium">
                  Item Name
                </label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) =>
                    handleItemChange(index, "name", e.target.value)
                  }
                  className="w-full px-4 py-2 border rounded-md focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">
                  Quantity
                </label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "quantity",
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 border rounded-md focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">
                  Priority
                </label>
                <select
                  value={item.priority}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "priority",
                      e.target.value as "LOW" | "MEDIUM" | "HIGH"
                    )
                  }
                  className="w-full px-4 py-2 border rounded-md focus:outline-none"
                >
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="text-red-500 hover:underline"
              >
                Remove Item
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddItem}
            className="text-blue-500 hover:underline"
          >
            + Add Another Item
          </button>
          <div>
            <label className="block text-gray-700 font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestMaterialModal;
