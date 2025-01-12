"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

interface AddContractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contractor: {
    name: string;
    email: string;
    phone: string;
    address: string;
    specialties: string[];
  }) => Promise<void>;
}

const AddContractorModal: React.FC<AddContractorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !phone || !address || !specialties) {
      toast.error("Please fill in all fields!");
      return;
    }

    setIsLoading(true);
    try {
      const specialtiesArray = specialties.split(",").map((s) => s.trim());
      await onSubmit({
        name,
        email,
        phone,
        address,
        specialties: specialtiesArray,
      });

      // Clear form and show success message
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setSpecialties("");
      toast.success("Contractor added successfully!");
      onClose();
    } catch (error) {
      console.error("Error adding contractor:", error);
      toast.error("Failed to add contractor. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add New Contractor</h2>
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
              Specialties (comma-separated)
            </label>
            <input
              type="text"
              value={specialties}
              onChange={(e) => setSpecialties(e.target.value)}
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
            {isLoading ? "Adding Contractor and Sending Invitation..." : "Add Contractor and Send Invitation"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddContractorModal;
