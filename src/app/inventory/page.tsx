"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, MapPin } from "lucide-react";
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import { InventoryItem } from "@/types/inventory";
import AddItemModal from "@/components/AddItemModal";
import Link from "next/link";
import { toast } from "sonner";
import { useUserPermissions } from "@/context/UserPermissionsContext";
import FloatingTooltip from "@/components/FloatingTooltip";

const InventoryDashboard = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>(""); // Search term state
  const router = useRouter();
  const { permissions } = useUserPermissions();

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/inventory/getItems");
        if (!response.ok) {
          throw new Error("Failed to fetch inventory items");
        }
        const data: InventoryItem[] = await response.json();
        setItems(data);
        setFilteredItems(data); // Initialize filtered list
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);
  
    const filtered = items.filter((item) => {
      const name = item.name?.toLowerCase() || "";
      const location = item.location?.toLowerCase() || "";
      const tags = item.tags || [];
  
      return (
        name.includes(searchValue) ||
        location.includes(searchValue) ||
        tags.some((tag) => tag.toLowerCase().includes(searchValue))
      );
    });
  
    setFilteredItems(filtered);
  };
  

  const handleAddItem = async (newItem: {
    name: string;
    description: string;
    tags: string[];
  }) => {
    try {
      const response = await fetch("/api/inventory/addItem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newItem,
          items: [],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add new item");
      }

      const addedItem: InventoryItem = await response.json();
      setItems((prevItems) => [...prevItems, addedItem]);
      setFilteredItems((prevItems) => [...prevItems, addedItem]);
      toast.success("Item added successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to add item.");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const canAddInventoryItem =
    permissions.includes("can_add_inventory_item") ||
    permissions.includes("admin") ||
    permissions.includes("inventory_manager") ||
    permissions.includes("procurement_team");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Inventory Dashboard</h1>
        <div className="flex gap-4">
          {!canAddInventoryItem ? (
            <FloatingTooltip message="Permission Required">
              <button
                disabled
                className="flex cursor-not-allowed items-center rounded-md bg-gray-200 px-4 py-2 text-gray-400"
              >
                <Plus size={20} className="mr-2" />
                Add Item
              </button>
            </FloatingTooltip>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
            >
              <Plus size={20} className="mr-2" />
              Add Item
            </button>
          )}

          <Link
            href="/inventory/suppliers"
            className="flex items-center rounded-md bg-gray-800 px-4 py-1 text-white hover:bg-slate-700"
          >
            <PrecisionManufacturingIcon className="mr-2" />
            Suppliers
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex w-full items-center rounded-md bg-white p-2 shadow-sm">
          <Search size={18} className="mr-2 text-gray-400" />
          <input
            type="text"
            placeholder="Search inventory..."
            className="w-full outline-none"
            value={searchTerm}
            onChange={handleSearch} // Search handler
          />
        </div>
      </div>

      {/* Inventory List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {filteredItems.map((item) => (
          <div
            key={item._id}
            onClick={() => router.push(`/inventory/${item._id}`)}
            className="cursor-pointer rounded-md bg-white p-4 shadow transition hover:shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{item.name}</h2>
              <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
            </div>
            {/* <div className="mb-2 text-gray-600">
              <MapPin className="mr-2 inline" />
              {item.location}
            </div> */}
            <div className="flex space-x-2">
              {item.tags.map((tag, index) => (
                <span
                  key={index}
                  className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddItem}
      />
    </div>
  );
};

export default InventoryDashboard;
