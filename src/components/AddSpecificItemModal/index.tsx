"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import DatePicker from "react-datepicker"; // Install react-datepicker if not already installed
import "react-datepicker/dist/react-datepicker.css";

interface AddSpecificItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: {
    specificItemId: string;
    price: number;
    location: string;
    maintenanceSchedule: string;
  }) => void;
}

const AddSpecificItemModal: React.FC<AddSpecificItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [specificItemId, setSpecificItemId] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [location, setLocation] = useState("");
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<Date | null>(
    null
  );

  const handleSubmit = () => {
    if (!specificItemId || !price || !location || !maintenanceSchedule) {
      alert("Please fill in all fields!");
      return;
    }

    onSubmit({
      specificItemId,
      price: Number(price),
      location,
      maintenanceSchedule: maintenanceSchedule.toISOString(),
    });

    // Clear form and close modal
    setSpecificItemId("");
    setPrice("");
    setLocation("");
    setMaintenanceSchedule(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add Specific Item</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Specific Item ID</label>
            <input
              type="text"
              value={specificItemId}
              onChange={(e) => setSpecificItemId(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-md focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Maintenance Schedule</label>
            <DatePicker
              selected={maintenanceSchedule}
              onChange={(date) => setMaintenanceSchedule(date)}
              dateFormat="yyyy-MM-dd"
              className="w-full px-4 py-2 border rounded-md focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Add Specific Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSpecificItemModal;
