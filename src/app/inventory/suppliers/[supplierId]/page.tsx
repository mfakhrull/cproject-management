"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Plus } from "lucide-react";
import { toast } from "sonner";
import AddMaterialModal from "@/components/AddMaterialModal";
import ComplianceDocuments from "@/components/ComplianceDocuments";
import { useAuth } from "@clerk/nextjs";
import { useUserPermissions } from "@/context/UserPermissionsContext"; // Import the hook
import FloatingTooltip from "@/components/FloatingTooltip"; // Import your tooltip component

interface Supplier {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  materials: string[];
  complianceDocs: {
    _id: string;
    fileName: string;
    fileUrl: string;
    uploadedBy: string;
  }[];
  orderHistory: {
    orderDate: string;
    quantity: number;
    description: string;
    status: string;
    totalAmount: number;
  }[];
}

interface OrderHistory {
  orderDate: string;
  quantity: number;
  description: string;
  status: string;
  totalAmount: number;
}

const SupplierDetailsPage = ({
  params,
}: {
  params: Promise<{ supplierId: string }>;
}) => {
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [newOrderHistory, setNewOrderHistory] = useState<OrderHistory>({
    orderDate: new Date().toISOString().split("T")[0],
    quantity: 0,
    description: "",
    status: "PENDING",
    totalAmount: 0,
  });
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { userId } = useAuth(); // Retrieve the authenticated user's clerkId

  const { permissions } = useUserPermissions(); // Get user permissions

  // Resolve supplierId from params
  useEffect(() => {
    async function resolveParams() {
      const resolvedParams = await params;
      setSupplierId(resolvedParams.supplierId);
    }
    resolveParams();
  }, [params]);

  // Fetch supplier details
  const fetchSupplierDetails = async () => {
    if (!supplierId) return;

    try {
      const response = await fetch(
        `/api/supplier/getSupplierDetails?supplierId=${supplierId}`,
      );
      const data: Supplier = await response.json();
      setSupplier(data);
    } catch (error) {
      console.error("Error fetching supplier:", error);
      toast.error("Error fetching supplier details");
    }
  };

  useEffect(() => {
    fetchSupplierDetails();
  }, [supplierId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index?: number,
  ) => {
    if (supplier) {
      const { name, value } = e.target;

      if (index !== undefined && supplier.orderHistory) {
        const updatedOrderHistory = [...supplier.orderHistory];
        updatedOrderHistory[index] = {
          ...updatedOrderHistory[index],
          [name]: value,
        };
        setSupplier({ ...supplier, orderHistory: updatedOrderHistory });
      } else {
        setSupplier((prev) => ({ ...prev!, [name]: value }));
      }
    }
  };

  const handleAddOrderHistory = () => {
    if (supplier) {
      const updatedOrderHistory = [...supplier.orderHistory, newOrderHistory];
      setSupplier({ ...supplier, orderHistory: updatedOrderHistory });
      setNewOrderHistory({
        orderDate: new Date().toISOString().split("T")[0],
        quantity: 0,
        description: "",
        status: "PENDING",
        totalAmount: 0,
      });
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/supplier/updateSupplierDetails/${supplierId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(supplier),
        },
      );

      if (!response.ok) throw new Error("Failed to update supplier");

      toast.success("Supplier updated successfully!");
      setEditMode(false);
      fetchSupplierDetails(); // Refresh supplier details
    } catch (error) {
      console.error("Error updating supplier:", error);
      toast.error("Error updating supplier details");
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
    formData.append("uploadedBy", userId); // Use the actual user ID

    try {
      setIsUploading(true);
      const response = await fetch(`/api/supplier/${supplierId}/compliance`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Error uploading document");

      const updatedSupplier = await response.json();
      setSupplier(updatedSupplier);
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
      const response = await fetch(`/api/supplier/${supplierId}/compliance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId }),
      });

      if (!response.ok) throw new Error("Error deleting document");

      const updatedSupplier = await response.json();
      setSupplier(updatedSupplier);
    } catch (error) {
      console.error(error);
      toast.error("Error deleting document.");
    }
  };

  //Check Permission
  const canEditSupplier =
    permissions.includes("can_add_inventory") ||
    permissions.includes("can_edit_inventory") ||
    permissions.includes("can_add_supplier") ||
    permissions.includes("can_edit_supplier") ||
    permissions.includes("admin") ||
    permissions.includes("inventory_manager") ||
    permissions.includes("procurement_team");

  if (!supplier) return <p>Loading supplier details...</p>;

  return (
    <div className="mx-auto max-w-[90%] p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Supplier Details</h1>
        {!canEditSupplier ? (
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
          {/* Supplier Information */}
          <div className="border-b border-gray-900/10 pb-12">
            <div className="grid grid-cols-1 gap-14 sm:grid-cols-3">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Supplier Information
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
                    value={supplier.name || ""}
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
                    value={supplier.email || ""}
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
                    value={supplier.phone || ""}
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
                    value={supplier.address || ""}
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

          {/* Materials */}
          <div className="border-b border-gray-900/10 pb-12">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Materials</h2>
                <p className="mt-1 text-sm text-gray-600">
                  List of materials provided by the supplier.
                </p>
              </div>
              <div className="space-y-4 sm:col-span-2">
                {supplier.materials.map((material, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <input
                      type="text"
                      name={`materials[${index}]`}
                      value={material}
                      onChange={(e) => {
                        const updatedMaterials = [...supplier.materials];
                        updatedMaterials[index] = e.target.value;
                        setSupplier({
                          ...supplier,
                          materials: updatedMaterials,
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
                          const updatedMaterials = [...supplier.materials];
                          updatedMaterials.splice(index, 1); // Remove the material
                          setSupplier({
                            ...supplier,
                            materials: updatedMaterials,
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
                        const updatedMaterials = [...supplier.materials, ""];
                        setSupplier({
                          ...supplier,
                          materials: updatedMaterials,
                        });
                      }}
                      className="flex items-center space-x-2 text-white hover:underline"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add Material</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compliance Documents */}
          <ComplianceDocuments
            supplierId={supplier._id}
            complianceDocs={supplier.complianceDocs}
            onFileUpload={handleFileUpload}
            isUploading={isUploading}
            onDeleteDocument={handleDeleteDocument}
          />

          {/* Order History */}
          <div className="border-y border-gray-900/10 py-12">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Order History
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Manage the order history of the supplier.
                </p>
              </div>
              <div className="space-y-4 sm:col-span-2">
                {supplier.orderHistory.map((order, index) => (
                  <div key={index} className="space-y-2 border-b pb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor={`orderDate-${index}`}
                          className="block text-sm font-medium text-gray-900"
                        >
                          Order Date
                        </label>
                        <input
                          id={`orderDate-${index}`}
                          type="date"
                          name="orderDate"
                          value={order.orderDate.split("T")[0]} // Format to "YYYY-MM-DD"
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
                          htmlFor={`quantity-${index}`}
                          className="block text-sm font-medium text-gray-900"
                        >
                          Quantity
                        </label>
                        <input
                          id={`quantity-${index}`}
                          type="number"
                          name="quantity"
                          value={order.quantity}
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
                          htmlFor={`description-${index}`}
                          className="block text-sm font-medium text-gray-900"
                        >
                          Description
                        </label>
                        <input
                          id={`description-${index}`}
                          type="text"
                          name="description"
                          value={order.description}
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
                          htmlFor={`status-${index}`}
                          className="block text-sm font-medium text-gray-900"
                        >
                          Status
                        </label>
                        <select
                          id={`status-${index}`}
                          name="status"
                          value={order.status}
                          onChange={(e) => handleInputChange(e, index)}
                          disabled={!editMode}
                          className={`mt-1 block w-full rounded-md px-3 py-2 ${
                            editMode
                              ? "bg-white outline outline-1 outline-gray-300"
                              : "bg-gray-100"
                          }`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="APPROVED">APPROVED</option>
                          <option value="REJECTED">REJECTED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor={`totalAmount-${index}`}
                        className="block text-sm font-medium text-gray-900"
                      >
                        Total Amount
                      </label>
                      <input
                        id={`totalAmount-${index}`}
                        type="number"
                        name="totalAmount"
                        value={order.totalAmount}
                        onChange={(e) => handleInputChange(e, index)}
                        readOnly={!editMode}
                        className={`mt-1 block w-full rounded-md px-3 py-2 ${
                          editMode
                            ? "bg-white outline outline-1 outline-gray-300"
                            : "bg-gray-100"
                        }`}
                      />
                    </div>
                    {editMode && (
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const updatedOrderHistory =
                              supplier.orderHistory.filter(
                                (_, i) => i !== index,
                              );
                            setSupplier({
                              ...supplier,
                              orderHistory: updatedOrderHistory,
                            });
                          }}
                          className="text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {editMode && (
                  <Button
                    type="button"
                    onClick={handleAddOrderHistory}
                    className="mt-4 flex items-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Order History</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end space-x-4">
            {editMode && (
              <Button onClick={handleUpdate} disabled={loading}>
                {loading ? "Updating..." : "Save Changes"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierDetailsPage;
