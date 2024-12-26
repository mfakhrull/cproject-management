"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (supplier: {
    name: string;
    email: string;
    phone: string;
    address: string;
    materials: string[];
  }) => Promise<void>; // Make this async for handling promise
}

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [materials, setMaterials] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !phone || !address || !materials) {
      toast.error("Please fill in all fields!");
      return;
    }

    setIsLoading(true);
    try {
      const materialsArray = materials.split(",").map((m) => m.trim());
      await onSubmit({ name, email, phone, address, materials: materialsArray });

      // Clear form and show success message
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setMaterials("");
      toast.success("Supplier added and invitation sent successfully!");
      onClose();
    } catch (error) {
      console.error("Error adding supplier:", error);
      toast.error("Failed to add supplier. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
            <label className="block text-gray-700 font-medium">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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
            className={`w-full px-4 py-2 rounded-md ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-slate-800 text-white hover:bg-slate-700"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Adding Supplier..." : "Add Supplier and Send Invitation"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSupplierModal;
