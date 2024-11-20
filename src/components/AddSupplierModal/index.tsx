"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface AddSupplierModalProps {
  isOpen: boolean; // Modal visibility state
  onClose: () => void; // Function to close the modal
  onSubmit: (supplier: {
    name: string;
    email: string;
    phone: string;
    materials: string[];
  }) => void; // Function to handle form submission
}

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [materials, setMaterials] = useState("");

  const handleSubmit = () => {
    if (!name || !email || !phone || !materials) {
      alert("Please fill in all fields!");
      return;
    }

    const materialsArray = materials.split(",").map((m) => m.trim());
    onSubmit({ name, email, phone, materials: materialsArray });

    // Clear form
    setName("");
    setEmail("");
    setPhone("");
    setMaterials("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add New Supplier</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">
              Materials (comma-separated)
            </label>
            <input
              type="text"
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Add Supplier
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSupplierModal;
