"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

interface EditSpecificItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedItem: {
    specificItemId: string;
    price: number;
    location: string;
    maintenanceSchedule: string; // Date as string in ISO format
  }) => void;
  initialData: {
    specificItemId: string;
    price: number;
    location: string;
    maintenanceSchedule: string; // Date as string in ISO format
  };
}

const EditSpecificItemModal: React.FC<EditSpecificItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState(initialData);

  // Sync formData with initialData when the modal is opened or initialData changes
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
    toast.success("Specific item updated successfully!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Edit Specific Item</h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            name="specificItemId"
            value={formData.specificItemId}
            onChange={handleChange}
            placeholder="Specific Item ID"
            className="w-full p-2 border rounded"
            disabled
          />
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Price"
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full p-2 border rounded"
          />
          <div>
            <label
              htmlFor="maintenanceSchedule"
              className="block text-sm font-medium text-gray-900"
            >
              Maintenance Schedule
            </label>
            <input
              type="date"
              id="maintenanceSchedule"
              name="maintenanceSchedule"
              value={formData.maintenanceSchedule || ""}
              onChange={handleChange}
              className="mt-2 block w-full rounded-md bg-white px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
            />
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditSpecificItemModal;
