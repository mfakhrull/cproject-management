// src/components/AddItemModal.tsx

"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: { name: string; description: string; tags: string[] }) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = () => {
    if (!name || !description) {
      alert("Please fill in all fields!");
      return;
    }
    const tagsArray = tags.split(",").map((tag) => tag.trim());
    onSubmit({ name, description, tags: tagsArray });
    setName("");
    setDescription("");
    setTags("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add New Item</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
