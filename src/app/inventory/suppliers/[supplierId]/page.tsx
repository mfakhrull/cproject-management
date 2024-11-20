"use client";

import React, { useEffect, useState } from "react";
import { Mail, Phone, Package, Plus } from "lucide-react";
import AddMaterialModal from "@/components/AddMaterialModal";
import { toast } from "sonner";

interface Supplier {
  _id: string;
  name: string;
  email: string;
  phone: string;
  materials: string[];
}

const SupplierDetailsPage = ({ params }: { params: Promise<{ supplierId: string }> }) => {
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Resolve params and extract supplierId
  useEffect(() => {
    async function resolveParams() {
      const resolvedParams = await params;
      setSupplierId(resolvedParams.supplierId);
    }
    resolveParams();
  }, [params]);

  // Fetch supplier details
  useEffect(() => {
    if (!supplierId) return;

    const fetchSupplierDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/supplier/getSupplierDetails?supplierId=${supplierId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch supplier details");
        }
        const data: Supplier = await response.json();
        setSupplier(data);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching supplier details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupplierDetails();
  }, [supplierId]);

  // Add material to supplier
  const handleAddMaterial = async (newMaterial: string) => {
    if (!supplierId) return;

    try {
      const response = await fetch(`/api/supplier/updateSupplierMaterial?supplierId=${supplierId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ material: newMaterial }),
      });

      if (!response.ok) {
        throw new Error("Failed to add material to supplier.");
      }

      const updatedSupplier: Supplier = await response.json();
      setSupplier(updatedSupplier);
      toast.success("Material added successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to add material.");
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

  if (!supplier) {
    return <div>No supplier found.</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-md shadow">
        <h1 className="text-2xl font-bold mb-2">{supplier.name}</h1>
        <p className="text-gray-600 flex items-center gap-2 mb-2">
          <Mail className="w-5 h-5 text-gray-500" />
          {supplier.email}
        </p>
        <p className="text-gray-600 flex items-center gap-2">
          <Phone className="w-5 h-5 text-gray-500" />
          {supplier.phone}
        </p>
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            Materials Provided
          </h2>
          <div className="flex flex-wrap gap-2">
            {supplier.materials.map((material, index) => (
              <span
                key={index}
                className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded"
              >
                {material}
              </span>
            ))}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            <Plus className="mr-2" />
            Add Material
          </button>
        </div>
      </div>

      {/* Add Material Modal */}
      <AddMaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddMaterial}
      />
    </div>
  );
};

export default SupplierDetailsPage;
