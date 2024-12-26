"use client";

import React, { useState, useEffect } from "react";
import { Plus, Mail, Phone, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import AddSupplierModal from "@/components/AddSupplierModal";
import { toast } from "sonner";

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
    const filtered = suppliers.filter((supplier) =>
      supplier.name.toLowerCase().includes(searchValue) ||
      supplier.email.toLowerCase().includes(searchValue) ||
      supplier.phone.includes(searchValue) ||
      supplier.materials.some((material) => material.toLowerCase().includes(searchValue)) // Check each material
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

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <button
          className="flex items-center bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-700"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={20} className="mr-2" />
          Add Supplier
        </button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((supplier) => (
          <div
            key={supplier._id}
            onClick={() => router.push(`/inventory/suppliers/${supplier._id}`)}
            className="cursor-pointer bg-white p-4 rounded-md shadow hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold mb-2">{supplier.name}</h2>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              {supplier.email}
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              {supplier.phone}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {supplier.materials.map((material, index) => (
                <span
                  key={index}
                  className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded"
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