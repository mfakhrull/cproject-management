"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IEmployee } from "@/models/Employee";

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeUpdated: () => void;
  initialData?: Partial<IEmployee>;
}

export const EditEmployeeModal = ({ isOpen, onClose, onEmployeeUpdated, initialData }: EditEmployeeModalProps) => {
  const [formData, setFormData] = useState<Partial<IEmployee>>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch(`/api/employees/updateemployee/${formData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      onEmployeeUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating employee:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div className="bg-white rounded-lg p-10 max-w-4xl">
        <h2 className="text-2xl font-bold mb-6">Edit Employee</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} required />
          <input type="text" name="role" value={formData.role || ''} onChange={handleInputChange} required />
          <input type="email" name="contact.email" value={formData?.contact?.email || ''} onChange={handleInputChange} required />
          <input type="text" name="contact.phone" value={formData?.contact?.phone || ''} onChange={handleInputChange} required />
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Employee"}
          </Button>
        </form>
      </div>
    </div>
  );
};
