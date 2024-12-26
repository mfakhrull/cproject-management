"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedItem: { name: string; description: string; tags: string[] }) => void;
  initialData: { name: string; description: string; tags: string[] } | null;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [tags, setTags] = useState<string>("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setTags(initialData.tags.join(", "));
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const updatedTags = tags.split(",").map((tag) => tag.trim());
    onSubmit({ name, description, tags: updatedTags });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="w-full max-w-md bg-white p-6 rounded-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Item</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 w-full bg-slate-800 text-white rounded hover:bg-slate-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditItemModal;
