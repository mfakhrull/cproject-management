"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { IEmployee } from "@/models/Employee";
import { LeaveRequestModal } from "@/components/leaves/LeaveRequestModal";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EmployeeSelfServicePage() {
  const router = useRouter();

  const { userId, isLoaded } = useAuth();
  const [employee, setEmployee] = useState<IEmployee | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingEmployee, setLoadingEmployee] = useState<boolean>(true);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);

  const fetchEmployee = async () => {
    setLoadingEmployee(true);
    try {
      const response = await fetch(`/api/employees/me`);

      if (response.status === 401) {
        toast.error("You are not authorized to access this page.");
        return;
      }

      if (response.status === 404) {
        toast.error("Employee details not found.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch employee details");
      }

      const data: IEmployee = await response.json();
      setEmployee(data);
    } catch (error) {
      console.error("Error fetching employee details:", error);
      toast.error("Error fetching employee details");
    } finally {
      setLoadingEmployee(false);
    }
  };

  useEffect(() => {
    if (isLoaded && userId) {
      fetchEmployee();
    }
  }, [isLoaded, userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmployee((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        contact: {
          ...prev.contact,
          [name]: value,
        },
      } as IEmployee;
    });
  };

  const handleUpdateContact = async () => {
    if (!employee) {
      toast.error("No employee data to update.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `/api/employees/updateemployee/${employee._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contact: employee.contact }),
        },
      );

      if (!response.ok) throw new Error("Failed to update contact information");

      toast.success("Contact information updated successfully!");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating contact information:", error);
      toast.error("Error updating contact information");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveSubmitted = () => {
    toast.success("Leave request submitted successfully.");
    setIsLeaveModalOpen(false);
  };

  const handleViewApplicationStatus = () => {
    router.push(`/leaves/employee`);
  };

  if (loadingEmployee) return <p>Loading employee details...</p>;

  if (!employee) return <p>Employee not found.</p>;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <div className="flex space-x-4">
          <Button
            onClick={() => setIsLeaveModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <span>Apply for Leave</span>
          </Button>

          <Button
            onClick={() => handleViewApplicationStatus()}
            className="flex items-center space-x-2"
          >
            <span>View Leave Status</span>
          </Button>
        </div>
      </div>

      <div className="rounded-lg bg-white p-8 shadow-md">
        <form className="space-y-12">
          {/* Personal Information */}
          <div className="border-b border-gray-900/10 pb-12">
            <div className="grid grid-cols-1 gap-14 sm:grid-cols-3">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Personal Information
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  This information helps identify the employee.
                </p>
              </div>
              <div className="space-y-4 sm:col-span-2">
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
                    value={employee.name || ""}
                    readOnly
                    className="mt-2 block w-full rounded-md bg-gray-100 px-3 py-2"
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
                    value={employee.role || ""}
                    readOnly
                    className="mt-2 block w-full rounded-md bg-gray-100 px-3 py-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-b border-gray-900/10 pb-12">
            <div className="grid grid-cols-1 gap-14 sm:grid-cols-3">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Contact Information
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  How we can reach the employee.
                </p>
              </div>
              <div className="space-y-4 sm:col-span-2">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={employee.contact?.email || ""}
                    onChange={handleInputChange}
                    readOnly={!editMode}
                    className={`mt-2 block w-full rounded-md px-3 py-2 ${editMode ? "bg-white" : "bg-gray-100"}`}
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Phone
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={employee.contact?.phone || ""}
                    onChange={handleInputChange}
                    readOnly={!editMode}
                    className={`mt-2 block w-full rounded-md px-3 py-2 ${editMode ? "bg-white" : "bg-gray-100"}`}
                  />
                </div>
                {editMode ? (
                  <div className="mt-8 flex justify-end space-x-4">
                    <Button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="bg-red-500 text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleUpdateContact}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                ) : (
                  <div className="mt-8 flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setEditMode(true)}
                      className="flex items-center space-x-2"
                    >
                      Edit Contact Info
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="border-b border-gray-900/10 pb-12">
            <div className="grid grid-cols-1 gap-14 sm:grid-cols-3">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Availability
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Employee work schedule and time off.
                </p>
              </div>
              <div className="space-y-4 sm:col-span-2">
                <div>
                  <label
                    htmlFor="hoursPerWeek"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Hours per Week
                  </label>
                  <input
                    type="number"
                    id="hoursPerWeek"
                    value={employee.availability?.hoursPerWeek || ""}
                    readOnly
                    className="mt-2 block w-full rounded-md bg-gray-100 px-3 py-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor="shiftPreference"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Shift Preference
                  </label>
                  <input
                    type="text"
                    id="shiftPreference"
                    value={employee.availability?.shiftPreference || ""}
                    readOnly
                    className="mt-2 block w-full rounded-md bg-gray-100 px-3 py-2"
                  />
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
                    value={employee.availability?.vacationDaysRemaining || ""}
                    readOnly
                    className="mt-2 block w-full rounded-md bg-gray-100 px-3 py-2"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Work History */}
          <div className="border-b border-gray-900/10 pb-12">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Work History
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  List of projects the employee has worked on.
                </p>
              </div>
              <div className="space-y-4 sm:col-span-2">
                {employee.workHistory?.map((history, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-900/10 pb-12"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <input value={history.projectId} readOnly />
                      <input value={history.role} readOnly />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>

      <LeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onLeaveSubmitted={handleLeaveSubmitted}
        employeeId={employee.employeeId} // Correctly pass string-based employeeId
      />
    </div>
  );
}
