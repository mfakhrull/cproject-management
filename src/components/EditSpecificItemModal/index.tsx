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
    maintenanceType: string[]; // Maintenance types as an array of strings
  }) => void;
  initialData: {
    specificItemId: string;
    price: number;
    location: string;
    maintenanceSchedule: string; // Date as string in ISO format
    maintenanceType: string[]; // Maintenance types as an array of strings
  };
}

const EditSpecificItemModal: React.FC<EditSpecificItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...initialData,
        maintenanceType: initialData.maintenanceType || [], // Ensure it's always an array
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMaintenanceTypeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      maintenanceType: e.target.value.split(",").map((type) => type.trim()),
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
    toast.success("Specific item updated successfully!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex justify-between">
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
            className="w-full rounded border p-2"
            disabled
          />
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Price"
            className="w-full rounded border p-2"
          />
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full rounded border p-2"
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
              className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
            />
          </div>
          <div>
            <label
              htmlFor="maintenanceType"
              className="block text-sm font-medium text-gray-900"
            >
              Maintenance Type (comma-separated)
            </label>
            <input
              type="text"
              id="maintenanceType"
              name="maintenanceType"
              value={
                Array.isArray(formData.maintenanceType)
                  ? formData.maintenanceType.join(", ")
                  : ""
              }
              onChange={handleMaintenanceTypeChange}
              className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
              placeholder="e.g., Cleaning, Inspection"
            />
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="mt-4 w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditSpecificItemModal;
