"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IEmployee } from "@/models/Employee";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeAdded: () => void;
}

export const EmployeeModal = ({
  isOpen,
  onClose,
  onEmployeeAdded,
}: EmployeeModalProps) => {
  const [formData, setFormData] = useState<Partial<IEmployee>>({});
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Check if the field belongs to `contact` or `availability`
    if (name.startsWith("contact.") || name.startsWith("availability.")) {
      const [parentKey, childKey] = name.split(".");
      setFormData((prevData) => ({
        ...prevData,
        [parentKey]: {
          ...(prevData[parentKey as keyof IEmployee] || {}), // Preserve existing nested data
          [childKey]: value,
        },
      }));
    } else {
      // For top-level fields like `name` and `role`
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleAddRolePermission = () => {
    setRolePermissions([...rolePermissions, ""]);
  };

  const handleRolePermissionChange = (
    index: number,
    value: string
  ) => {
    const updatedPermissions = [...rolePermissions];
    updatedPermissions[index] = value;
    setRolePermissions(updatedPermissions);
  };

  const handleRemoveRolePermission = (index: number) => {
    const updatedPermissions = [...rolePermissions];
    updatedPermissions.splice(index, 1);
    setRolePermissions(updatedPermissions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/employees/createemployee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, rolePermissions }),
      });

      if (!response.ok) {
        throw new Error("Failed to create employee");
      }

      onEmployeeAdded();
      onClose();
    } catch (error) {
      console.error("Error creating employee:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl px-12 py-8">
        <h2 className="text-3xl font-semibold mb-8">Add New Employee</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Name and Role */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-900"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 outline outline-1 outline-gray-300 focus-within:outline-2 focus-within:outline-blue-600 sm:text-base"
                placeholder="John Doe"
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-900"
              >
                Role
              </label>
              <input
                type="text"
                id="role"
                name="role"
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 outline outline-1 outline-gray-300 focus-within:outline-2 focus-within:outline-blue-600 sm:text-base"
                placeholder="Software Engineer"
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div>
                <label
                  htmlFor="contact.email"
                  className="block text-sm font-medium text-gray-900"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="contact.email"
                  name="contact.email"
                  className="mt-2 block w-full rounded-md bg-white px-3 py-2 outline outline-1 outline-gray-300 focus-within:outline-2 focus-within:outline-blue-600 sm:text-base"
                  placeholder="johndoe@example.com"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="contact.phone"
                  className="block text-sm font-medium text-gray-900"
                >
                  Phone
                </label>
                <input
                  type="text"
                  id="contact.phone"
                  name="contact.phone"
                  className="mt-2 block w-full rounded-md bg-white px-3 py-2 outline outline-1 outline-gray-300 focus-within:outline-2 focus-within:outline-blue-600 sm:text-base"
                  placeholder="+1 234 567 890"
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Availability */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Availability</h3>
            <div className="grid grid-cols-3 gap-6 mt-6">
              <div>
                <label
                  htmlFor="availability.hoursPerWeek"
                  className="block text-sm font-medium text-gray-900"
                >
                  Hours per Week
                </label>
                <input
                  type="number"
                  id="availability.hoursPerWeek"
                  name="availability.hoursPerWeek"
                  className="mt-2 block w-full rounded-md bg-white px-3 py-2 outline outline-1 outline-gray-300 focus-within:outline-2 focus-within:outline-blue-600 sm:text-base"
                  placeholder="40"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="availability.shiftPreference"
                  className="block text-sm font-medium text-gray-900"
                >
                  Shift Preference
                </label>
                <select
                  id="availability.shiftPreference"
                  name="availability.shiftPreference"
                  className="mt-2 block w-full rounded-md bg-white px-3 py-2 outline outline-1 outline-gray-300 focus-within:outline-2 focus-within:outline-blue-600 sm:text-base"
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a shift</option>
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="availability.vacationDaysRemaining"
                  className="block text-sm font-medium text-gray-900"
                >
                  Vacation Days Remaining
                </label>
                <input
                  type="number"
                  id="availability.vacationDaysRemaining"
                  name="availability.vacationDaysRemaining"
                  className="mt-2 block w-full rounded-md bg-white px-3 py-2 outline outline-1 outline-gray-300 focus-within:outline-2 focus-within:outline-blue-600 sm:text-base"
                  placeholder="14"
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Role Permissions */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Role Permissions
            </h3>
            {rolePermissions.map((permission, index) => (
              <div key={index} className="flex items-center mt-2 gap-4">
                <input
                  type="text"
                  value={permission}
                  placeholder="Permission key (e.g., inventory)"
                  className="flex-grow rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) =>
                    handleRolePermissionChange(index, e.target.value)
                  }
                />
                <Button
                  variant="secondary"
                  onClick={() => handleRemoveRolePermission(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddRolePermission}
              className="mt-4"
            >
              Add Role Permission
            </Button>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-6 mt-8">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="px-8 py-3"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="px-8 py-3">
              {loading ? "Adding..." : "Add Employee and Send Invitation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
