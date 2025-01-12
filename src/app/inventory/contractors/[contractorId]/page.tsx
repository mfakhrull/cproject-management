"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Plus } from "lucide-react";
import { toast } from "sonner";
import ComplianceDocuments from "@/components/ContractorComplianceDocuments";
import { useAuth } from "@clerk/nextjs";
import { useUserPermissions } from "@/context/UserPermissionsContext";
import FloatingTooltip from "@/components/FloatingTooltip";

interface Contractor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  specialties: string[];
  complianceDocs: {
    _id: string;
    fileName: string;
    fileUrl: string;
    uploadedBy: string;
  }[];
  projectHistory: {
    projectId: string;
    projectName: string;
    startDate: string;
    endDate: string | null;
    status: string;
    totalCost: number;
  }[];
}

interface ProjectHistory {
  projectId: string;
  projectName: string;
  startDate: string;
  endDate: string | null;
  status: string;
  totalCost: number;
}

const ContractorDetailsPage = ({
  params,
}: {
  params: Promise<{ contractorId: string }>;
}) => {
  const [contractorId, setContractorId] = useState<string | null>(null);
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [newProjectHistory, setNewProjectHistory] = useState<ProjectHistory>({
    projectId: "",
    projectName: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: null,
    status: "ONGOING",
    totalCost: 0,
  });
  const [isUploading, setIsUploading] = useState(false);
  const { userId } = useAuth();

  const { permissions } = useUserPermissions();

  useEffect(() => {
    async function resolveParams() {
      const resolvedParams = await params;
      setContractorId(resolvedParams.contractorId);
    }
    resolveParams();
  }, [params]);

  const fetchContractorDetails = async () => {
    if (!contractorId) return;

    try {
      const response = await fetch(
        `/api/contractor/getContractorDetails?contractorId=${contractorId}`
      );
      const data: Contractor = await response.json();
      setContractor({ ...data, projectHistory: data.projectHistory || [] });
    } catch (error) {
      console.error("Error fetching contractor:", error);
      toast.error("Error fetching contractor details");
    }
  };

  useEffect(() => {
    fetchContractorDetails();
  }, [contractorId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index?: number
  ) => {
    if (contractor) {
      const { name, value } = e.target;

      if (index !== undefined && contractor.projectHistory) {
        const updatedProjectHistory = [...contractor.projectHistory];
        updatedProjectHistory[index] = {
          ...updatedProjectHistory[index],
          [name]: value,
        };
        setContractor({ ...contractor, projectHistory: updatedProjectHistory });
      } else {
        setContractor((prev) => ({ ...prev!, [name]: value }));
      }
    }
  };

  const handleAddProjectHistory = () => {
    if (contractor) {
      const updatedProjectHistory = [
        ...contractor.projectHistory,
        newProjectHistory,
      ];
      setContractor({ ...contractor, projectHistory: updatedProjectHistory });
      setNewProjectHistory({
        projectId: "",
        projectName: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: null,
        status: "ONGOING",
        totalCost: 0,
      });
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/contractor/updateContractorDetails/${contractorId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contractor),
        }
      );

      if (!response.ok) throw new Error("Failed to update contractor");

      toast.success("Contractor updated successfully!");
      setEditMode(false);
      fetchContractorDetails();
    } catch (error) {
      console.error("Error updating contractor:", error);
      toast.error("Error updating contractor details");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!userId) {
      toast.error("User not authenticated. Please log in.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadedBy", userId);

    try {
      setIsUploading(true);
      const response = await fetch(
        `/api/contractor/${contractorId}/compliance`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Error uploading document");

      const updatedContractor = await response.json();
      setContractor(updatedContractor);
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Error uploading document.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const response = await fetch(
        `/api/contractor/${contractorId}/compliance`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ docId }),
        }
      );

      if (!response.ok) throw new Error("Error deleting document");

      const updatedContractor = await response.json();
      setContractor(updatedContractor);
    } catch (error) {
      console.error(error);
      toast.error("Error deleting document.");
    }
  };

  const canEditContractor =
    permissions.includes("can_add_inventory") ||
    permissions.includes("can_edit_inventory") ||
    permissions.includes("can_add_contractor") ||
    permissions.includes("can_edit_contractor") ||
    permissions.includes("admin") ||
    permissions.includes("inventory_manager") ||
    permissions.includes("procurement_team");

  if (!contractor) return <p>Loading contractor details...</p>;

  return (
    <div className="mx-auto max-w-[90%] p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contractor Details</h1>
        {!canEditContractor ? (
          <button
            className="cursor-not-allowed rounded-full p-2 text-gray-300"
            disabled
          >
            <FloatingTooltip message="Permission Required">
              <Edit className="h-5 w-5" />
            </FloatingTooltip>
          </button>
        ) : (
          <Button
            onClick={() => setEditMode(!editMode)}
            className="flex items-center space-x-2"
          >
            <Edit className="h-5 w-5" />
            <span>{editMode ? "Cancel" : "Edit"}</span>
          </Button>
        )}
      </div>

      <div className="rounded-lg bg-white p-8 shadow-md">
        <form className="space-y-12">
          {/* Contractor Information */}
          <div className="border-b border-gray-900/10 pb-12">
            <div className="grid grid-cols-1 gap-14 sm:grid-cols-3">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Contractor Information
                </h2>
              </div>
              <div className="space-y-4 sm:col-span-2">
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={contractor.name || ""}
                    onChange={handleInputChange}
                    readOnly={!editMode}
                    className={`mt-2 block w-full rounded-md px-3 py-2 ${
                      editMode
                        ? "bg-white outline outline-1 outline-gray-300"
                        : "bg-gray-100"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={contractor.email || ""}
                    onChange={handleInputChange}
                    readOnly={!editMode}
                    className={`mt-2 block w-full rounded-md px-3 py-2 ${
                      editMode
                        ? "bg-white outline outline-1 outline-gray-300"
                        : "bg-gray-100"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={contractor.phone || ""}
                    onChange={handleInputChange}
                    readOnly={!editMode}
                    className={`mt-2 block w-full rounded-md px-3 py-2 ${
                      editMode
                        ? "bg-white outline outline-1 outline-gray-300"
                        : "bg-gray-100"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={contractor.address || ""}
                    onChange={handleInputChange}
                    readOnly={!editMode}
                    className={`mt-2 block w-full rounded-md px-3 py-2 ${
                      editMode
                        ? "bg-white outline outline-1 outline-gray-300"
                        : "bg-gray-100"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div className="border-b border-gray-900/10 pb-12">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Specialties
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  List of specialties of the contractor.
                </p>
              </div>
              <div className="space-y-4 sm:col-span-2">
                {contractor.specialties.map((specialty, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <input
                      type="text"
                      name={`specialties[${index}]`}
                      value={specialty}
                      onChange={(e) => {
                        const updatedSpecialties = [
                          ...contractor.specialties,
                        ];
                        updatedSpecialties[index] = e.target.value;
                        setContractor({
                          ...contractor,
                          specialties: updatedSpecialties,
                        });
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
                          const updatedSpecialties = [
                            ...contractor.specialties,
                          ];
                          updatedSpecialties.splice(index, 1);
                          setContractor({
                            ...contractor,
                            specialties: updatedSpecialties,
                          });
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
                    <Button
                      type="button"
                      onClick={() => {
                        const updatedSpecialties = [
                          ...contractor.specialties,
                          "",
                        ];
                        setContractor({
                          ...contractor,
                          specialties: updatedSpecialties,
                        });
                      }}
                      className="flex items-center space-x-2 text-white hover:underline"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add Specialty</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compliance Documents */}
          <ComplianceDocuments
            contractorId={contractor._id}
            complianceDocs={contractor.complianceDocs}
            onFileUpload={handleFileUpload}
            isUploading={isUploading}
            onDeleteDocument={handleDeleteDocument}
          />

          {/* Project History */}
          <div className="border-y border-gray-900/10 py-12">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Project History
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Manage the project history of the contractor.
                </p>
              </div>
              <div className="space-y-4 sm:col-span-2">
                {contractor.projectHistory.map((project, index) => (
                  <div key={index} className="space-y-2 border-b pb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor={`projectId-${index}`}
                          className="block text-sm font-medium text-gray-900"
                        >
                          Project ID
                        </label>
                        <input
                          id={`projectId-${index}`}
                          type="text"
                          name="projectId"
                          value={project.projectId}
                          onChange={(e) => handleInputChange(e, index)}
                          readOnly={!editMode}
                          className={`mt-1 block w-full rounded-md px-3 py-2 ${
                            editMode
                              ? "bg-white outline outline-1 outline-gray-300"
                              : "bg-gray-100"
                          }`}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`projectName-${index}`}
                          className="block text-sm font-medium text-gray-900"
                        >
                          Project Name
                        </label>
                        <input
                          id={`projectName-${index}`}
                          type="text"
                          name="projectName"
                          value={project.projectName}
                          onChange={(e) => handleInputChange(e, index)}
                          readOnly={!editMode}
                          className={`mt-1 block w-full rounded-md px-3 py-2 ${
                            editMode
                              ? "bg-white outline outline-1 outline-gray-300"
                              : "bg-gray-100"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor={`startDate-${index}`}
                          className="block text-sm font-medium text-gray-900"
                        >
                          Start Date
                        </label>
                        <input
                          id={`startDate-${index}`}
                          type="date"
                          name="startDate"
                          value={project.startDate.split("T")[0]}
                          onChange={(e) => handleInputChange(e, index)}
                          readOnly={!editMode}
                          className={`mt-1 block w-full rounded-md px-3 py-2 ${
                            editMode
                              ? "bg-white outline outline-1 outline-gray-300"
                              : "bg-gray-100"
                          }`}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`endDate-${index}`}
                          className="block text-sm font-medium text-gray-900"
                        >
                          End Date
                        </label>
                        <input
                          id={`endDate-${index}`}
                          type="date"
                          name="endDate"
                          value={project.endDate ? project.endDate.split("T")[0] : ""}
                          onChange={(e) => handleInputChange(e, index)}
                          readOnly={!editMode}
                          className={`mt-1 block w-full rounded-md px-3 py-2 ${
                            editMode
                              ? "bg-white outline outline-1 outline-gray-300"
                              : "bg-gray-100"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor={`status-${index}`}
                          className="block text-sm font-medium text-gray-900"
                        >
                          Status
                        </label>
                        <select
                          id={`status-${index}`}
                          name="status"
                          value={project.status}
                          onChange={(e) => handleInputChange(e, index)}
                          disabled={!editMode}
                          className={`mt-1 block w-full rounded-md px-3 py-2 ${
                            editMode
                              ? "bg-white outline outline-1 outline-gray-300"
                              : "bg-gray-100"
                          }`}
                        >
                          <option value="ONGOING">ONGOING</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor={`totalCost-${index}`}
                          className="block text-sm font-medium text-gray-900"
                        >
                          Total Cost
                        </label>
                        <input
                          id={`totalCost-${index}`}
                          type="number"
                          name="totalCost"
                          value={project.totalCost}
                          onChange={(e) => handleInputChange(e, index)}
                          readOnly={!editMode}
                          className={`mt-1 block w-full rounded-md px-3 py-2 ${
                            editMode
                              ? "bg-white outline outline-1 outline-gray-300"
                              : "bg-gray-100"
                          }`}
                        />
                      </div>
                    </div>
                    {editMode && (
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const updatedProjectHistory =
                              contractor.projectHistory.filter(
                                (_, i) => i !== index
                              );
                            setContractor({
                              ...contractor,
                              projectHistory: updatedProjectHistory,
                            });
                          }}
                          className="text-red-500 hover:underline"
                        >
                          Remove Project
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {editMode && (
                  <div className="mt-4">
                    <Button
                      type="button"
                      onClick={handleAddProjectHistory}
                      className="flex items-center space-x-2 text-white hover:underline"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add Project</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {editMode && (
            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                onClick={handleUpdate}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                {loading ? (
                  <span>Updating...</span>
                ) : (
                  <>
                    <Edit className="h-5 w-5" />
                    <span>Update Contractor</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ContractorDetailsPage;
