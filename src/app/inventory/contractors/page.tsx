"use client";

import React, { useState, useEffect } from "react";
import { Plus, Mail, Phone, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import AddContractorModal from "@/components/AddContractorModal";
import { toast } from "sonner";
import { useUserPermissions } from "@/context/UserPermissionsContext";
import FloatingTooltip from "@/components/FloatingTooltip";

interface Contractor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
}

const ContractorListPage = () => {
  const router = useRouter();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [filteredContractors, setFilteredContractors] = useState<Contractor[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { permissions } = useUserPermissions();

  useEffect(() => {
    const fetchContractors = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/contractor/getContractors");
        if (!response.ok) {
          throw new Error("Failed to fetch contractors");
        }
        const data: Contractor[] = await response.json();
        setContractors(data);
        setFilteredContractors(data); // Initialize filtered list
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContractors();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);

    // Filter contractors based on the search term
    const filtered = contractors.filter(
      (contractor) =>
        contractor.name.toLowerCase().includes(searchValue) ||
        contractor.email.toLowerCase().includes(searchValue) ||
        contractor.phone.includes(searchValue) ||
        contractor.specialties.some((specialty) =>
          specialty.toLowerCase().includes(searchValue),
        ), // Check each specialty
    );

    setFilteredContractors(filtered);
  };

  const handleAddContractor = async (newContractor: {
    name: string;
    email: string;
    phone: string;
    specialties: string[];
  }) => {
    try {
      const response = await fetch("/api/contractor/addContractor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContractor),
      });

      if (!response.ok) {
        throw new Error("Failed to add contractor.");
      }

      const addedContractor: Contractor = await response.json();
      setContractors([...contractors, addedContractor]);
      setFilteredContractors([...filteredContractors, addedContractor]); // Update filtered list
      toast.success("Contractor added successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to add contractor.");
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

  const canAddContractor =
    permissions.includes("can_add_contractor") ||
    permissions.includes("admin") ||
    permissions.includes("project_manager");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contractors</h1>
        {!canAddContractor ? (
          <FloatingTooltip message="Permission Required">
            <button
              disabled
              className="flex cursor-not-allowed items-center rounded-md bg-gray-200 px-4 py-2 text-gray-400"
            >
              <Plus size={20} className="mr-2" />
              Add Contractor
            </button>
          </FloatingTooltip>
        ) : (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
          >
            <Plus size={20} className="mr-2" />
            Add Contractor
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex w-full items-center rounded-md bg-white p-2 shadow-sm">
          <Search size={20} className="mr-2 text-gray-400" />
          <input
            type="text"
            placeholder="Search contractor..."
            className="w-full outline-none"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Contractor List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredContractors.map((contractor) => (
          <div
            key={contractor._id}
            onClick={() =>
              router.push(`/inventory/contractors/${contractor._id}`)
            }
            className="cursor-pointer rounded-md bg-white p-4 shadow transition hover:shadow-lg"
          >
            <h2 className="mb-2 text-lg font-semibold">{contractor.name}</h2>
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-gray-500" />
              {contractor.email}
            </p>
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-gray-500" />
              {contractor.phone}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {contractor.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-600"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Contractor Modal */}
      <AddContractorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddContractor}
      />
    </div>
  );
};

export default ContractorListPage;
