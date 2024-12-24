"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IEmployee, IWorkHistory } from "@/models/Employee";
import { Edit, Plus } from "lucide-react";
import { toast } from "sonner";

export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState<Partial<IEmployee> | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [newWorkHistory, setNewWorkHistory] = useState<IWorkHistory>({
    projectId: "",
    role: "",
    startDate: new Date(),
    endDate: undefined,
  });

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`/api/employees/getemployee/${id}`);
      const data: IEmployee = await response.json();
      setEmployee(data);
    } catch (error) {
      console.error("Error fetching employee:", error);
      toast.error("Error fetching employee details");
    }
  };

  useEffect(() => {
    if (id) fetchEmployee();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (employee) {
      const { name, value } = e.target;

      const [field, subField] = name.split(".");
      if (subField) {
        setEmployee((prev) => ({
          ...prev,
          [field]: {
            ...(prev?.[field as keyof IEmployee] as Record<string, any>),
            [subField]: value,
          },
        }));
      } else {
        setEmployee((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  const handleAddWorkHistory = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent the default form submission
    if (employee) {
      const updatedWorkHistory = [
        ...(employee.workHistory || []),
        newWorkHistory,
      ];
      setEmployee({ ...employee, workHistory: updatedWorkHistory });
      setNewWorkHistory({
        projectId: "",
        role: "",
        startDate: new Date(),
        endDate: undefined,
      });
    }
  };

  const handleWorkHistoryInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (employee?.workHistory) {
      const updatedWorkHistory = [...employee.workHistory];
      updatedWorkHistory[index] = {
        ...updatedWorkHistory[index],
        [e.target.name]: e.target.value,
      };
      setEmployee({ ...employee, workHistory: updatedWorkHistory });
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/employees/updateemployee/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee),
      });

      if (!response.ok) throw new Error("Failed to update employee");

      toast.success("Employee updated successfully!");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Error updating employee details");
    } finally {
      setLoading(false);
    }
  };

  if (!employee) return <p>Loading employee details...</p>;

  return (
    <div className="mx-auto max-w-[90%] p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Employee Details</h1>
        <Button
          onClick={() => setEditMode(!editMode)}
          className="flex items-center space-x-2"
        >
          <Edit className="h-5 w-5" />
          <span>{editMode ? "Cancel" : "Edit"}</span>
        </Button>
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
                    name="name"
                    value={employee.name || ""}
                    onChange={handleInputChange}
                    readOnly={!editMode}
                    className={`mt-2 block w-full rounded-md px-3 py-2 ${
                      editMode
                        ? "bg-white outline outline-1 outline-gray-300"
                        : "bg-gray-100"
                    }`}
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
                    value={employee.role || ""}
                    onChange={handleInputChange}
                    readOnly={!editMode}
                    className={`mt-2 block w-full rounded-md px-3 py-2 ${
                      editMode
                        ? "bg-white outline outline-1 outline-gray-300"
                        : "bg-gray-100"
                    }`}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="rolePermissions"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Role Permissions
                  </label>
                  {employee.rolePermissions?.map((permission, index) => (
                    <div
                      key={index}
                      className="mt-2 flex items-center space-x-4"
                    >
                      <input
                        type="text"
                        name={`rolePermissions[${index}]`}
                        value={permission}
                        onChange={(e) => {
                          const updatedPermissions = [
                            ...(employee.rolePermissions || []),
                          ];
                          updatedPermissions[index] = e.target.value;
                          setEmployee((prev) => ({
                            ...prev!,
                            rolePermissions: updatedPermissions,
                          }));
                        }}
                        readOnly={!editMode}
                        className={`block w-full rounded-md px-3 py-2 ${
                          editMode
                            ? "bg-white outline outline-1 outline-gray-300"
                            : "bg-gray-100"
                        }`}
                      />
                      {editMode && (
                        <button
                          type="button"
                          onClick={() => {
                            const updatedPermissions = [
                              ...(employee.rolePermissions || []),
                            ];
                            updatedPermissions.splice(index, 1); // Remove this permission
                            setEmployee((prev) => ({
                              ...prev!,
                              rolePermissions: updatedPermissions,
                            }));
                          }}
                          className="text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {editMode && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          const updatedPermissions = [
                            ...(employee.rolePermissions || []),
                            "",
                          ];
                          setEmployee((prev) => ({
                            ...prev!,
                            rolePermissions: updatedPermissions,
                          }));
                        }}
                        className="flex items-center space-x-2 text-blue-500 hover:underline"
                      >
                        <Plus className="h-5 w-5" />
                        <span>Add Role Permission</span>
                      </button>
                    </div>
                  )}
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
                    htmlFor="contact.email"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="contact.email"
                    name="contact.email"
                    value={employee.contact?.email || ""}
                    onChange={handleInputChange}
                    readOnly={!editMode}
                    className={`mt-2 block w-full rounded-md px-3 py-2 ${
                      editMode
                        ? "bg-white outline outline-1 outline-gray-300"
                        : "bg-gray-100"
                    }`}
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
                    value={employee.contact?.phone || ""}
                    onChange={handleInputChange}
                    readOnly={!editMode}
                    className={`mt-2 block w-full rounded-md px-3 py-2 ${
                      editMode
                        ? "bg-white outline outline-1 outline-gray-300"
                        : "bg-gray-100"
                    }`}
                    required
                  />
                </div>
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
                    htmlFor="availability.hoursPerWeek"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Hours per Week
                  </label>
                  <input
                    type="number"
                    id="availability.hoursPerWeek"
                    name="availability.hoursPerWeek"
                    value={employee.availability?.hoursPerWeek || ""}
                    onChange={handleInputChange}
                    readOnly={!editMode}
                    className={`mt-2 block w-full rounded-md px-3 py-2 ${
                      editMode
                        ? "bg-white outline outline-1 outline-gray-300"
                        : "bg-gray-100"
                    }`}
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
                    value={employee.availability?.shiftPreference || ""}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={`mt-2 block w-full rounded-md px-3 py-2 ${
                      editMode
                        ? "bg-white outline outline-1 outline-gray-300"
                        : "bg-gray-100"
                    }`}
                  >
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
                    value={employee.availability?.vacationDaysRemaining || ""}
                    onChange={handleInputChange}
                    readOnly={!editMode}
                    className={`mt-2 block w-full rounded-md px-3 py-2 ${
                      editMode
                        ? "bg-white outline outline-1 outline-gray-300"
                        : "bg-gray-100"
                    }`}
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
                  <div className="border-b border-gray-900/10 pb-12">
                    <div key={index} className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="projectId"
                          value={history.projectId}
                          placeholder="Project ID"
                          onChange={(e) =>
                            handleWorkHistoryInputChange(e, index)
                          }
                          readOnly={!editMode}
                          className={`block w-full rounded-md px-3 py-2 ${
                            editMode
                              ? "bg-white outline outline-1 outline-gray-300"
                              : "bg-gray-100"
                          }`}
                        />
                        <input
                          type="text"
                          name="role"
                          value={history.role}
                          placeholder="Role"
                          onChange={(e) =>
                            handleWorkHistoryInputChange(e, index)
                          }
                          readOnly={!editMode}
                          className={`block w-full rounded-md px-3 py-2 ${
                            editMode
                              ? "bg-white outline outline-1 outline-gray-300"
                              : "bg-gray-100"
                          }`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="date"
                          name="startDate"
                          value={
                            history.startDate
                              ? new Date(history.startDate)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            handleWorkHistoryInputChange(e, index)
                          }
                          readOnly={!editMode}
                          className={`block w-full rounded-md px-3 py-2 ${
                            editMode
                              ? "bg-white outline outline-1 outline-gray-300"
                              : "bg-gray-100"
                          }`}
                        />
                        <input
                          type="date"
                          name="endDate"
                          value={
                            history.endDate
                              ? new Date(history.endDate)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            handleWorkHistoryInputChange(e, index)
                          }
                          readOnly={!editMode}
                          className={`block w-full rounded-md px-3 py-2 ${
                            editMode
                              ? "bg-white outline outline-1 outline-gray-300"
                              : "bg-gray-100"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {editMode && (
                  <Button
                    type="button"
                    onClick={handleAddWorkHistory}
                    className="mt-4 flex items-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Work History</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end space-x-4">
            {editMode && (
              <Button
                onClick={handleUpdate}
                disabled={loading}
                className="px-6 py-2"
              >
                {loading ? "Updating..." : "Save Changes"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
