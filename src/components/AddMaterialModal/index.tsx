"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface AddMaterialModalProps {
  isOpen: boolean; // Whether the modal is visible
  onClose: () => void; // Function to close the modal
  onSubmit: (material: string) => void; // Function to handle submission with the material name
}

const AddMaterialModal: React.FC<AddMaterialModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [material, setMaterial] = useState("");

  const handleSubmit = () => {
    if (!material) {
      alert("Material name is required!");
      return;
    }
    onSubmit(material);
    setMaterial("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add Material</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Material Name</label>
          <input
            type="text"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none"
          />
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Add Material
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMaterialModal;
