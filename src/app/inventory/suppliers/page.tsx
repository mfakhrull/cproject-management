"use client";

import React, { useState, useEffect } from "react";
import { Plus, Mail, Phone, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import AddSupplierModal from "@/components/AddSupplierModal";
import { toast } from "sonner";
import { useUserPermissions } from "@/context/UserPermissionsContext";
import FloatingTooltip from "@/components/FloatingTooltip";

interface Supplier {
  _id: string;
  name: string;
  email: string;
  phone: string;
  materials: string[];
}

const SupplierListPage = () => {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { permissions } = useUserPermissions();

  useEffect(() => {
    const fetchSuppliers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/supplier/getSuppliers");
        if (!response.ok) {
          throw new Error("Failed to fetch suppliers");
        }
        const data: Supplier[] = await response.json();
        setSuppliers(data);
        setFilteredSuppliers(data); // Initialize filtered list
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);

    // Filter suppliers based on the search term
    const filtered = suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(searchValue) ||
        supplier.email.toLowerCase().includes(searchValue) ||
        supplier.phone.includes(searchValue) ||
        supplier.materials.some((material) =>
          material.toLowerCase().includes(searchValue),
        ), // Check each material
    );

    setFilteredSuppliers(filtered);
  };

  const handleAddSupplier = async (newSupplier: {
    name: string;
    email: string;
    phone: string;
    materials: string[];
  }) => {
    try {
      const response = await fetch("/api/supplier/addSupplier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSupplier),
      });

      if (!response.ok) {
        throw new Error("Failed to add supplier.");
      }

      const addedSupplier: Supplier = await response.json();
      setSuppliers([...suppliers, addedSupplier]);
      setFilteredSuppliers([...filteredSuppliers, addedSupplier]); // Update filtered list
      toast.success("Supplier added successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to add supplier.");
    } finally {
      setIsModalOpen(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const canAddSupplier =
    permissions.includes("can_add_supplier") ||
    permissions.includes("can_add_inventory_item") ||
    permissions.includes("admin") ||
    permissions.includes("inventory_manager") ||
    permissions.includes("procurement_team");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        {!canAddSupplier ? (
          <FloatingTooltip message="Permission Required">
            <button
              disabled
              className="flex cursor-not-allowed items-center rounded-md bg-gray-200 px-4 py-2 text-gray-400"
            >
              <Plus size={20} className="mr-2" />
              Add Supplier
            </button>
          </FloatingTooltip>
        ) : (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
          >
            <Plus size={20} className="mr-2" />
            Add Supplier
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex w-full items-center rounded-md bg-white p-2 shadow-sm">
          <Search size={20} className="mr-2 text-gray-400" />
          <input
            type="text"
            placeholder="Search supplier..."
            className="w-full outline-none"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Supplier List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSuppliers.map((supplier) => (
          <div
            key={supplier._id}
            onClick={() => router.push(`/inventory/suppliers/${supplier._id}`)}
            className="cursor-pointer rounded-md bg-white p-4 shadow transition hover:shadow-lg"
          >
            <h2 className="mb-2 text-lg font-semibold">{supplier.name}</h2>
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-gray-500" />
              {supplier.email}
            </p>
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-gray-500" />
              {supplier.phone}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {supplier.materials.map((material, index) => (
                <span
                  key={index}
                  className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-600"
                >
                  {material}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Supplier Modal */}
      <AddSupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSupplier}
      />
    </div>
  );
};

export default SupplierListPage;
