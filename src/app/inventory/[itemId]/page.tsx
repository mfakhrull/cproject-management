"use client";

import React, { useEffect, useState } from "react";
import {
  DollarSign,
  MapPin,
  Calendar,
  Tag,
  Info,
  Plus,
  Edit3,
  ChartNoAxesCombined,
} from "lucide-react";
import AddSpecificItemModal from "@/components/AddSpecificItemModal";
import EditItemModal from "@/components/EditItemModal";
import { toast } from "sonner";
import EditSpecificItemModal from "@/components/EditSpecificItemModal";
import { useUserPermissions } from "@/context/UserPermissionsContext"; // Import the hook
import FloatingTooltip from "@/components/FloatingTooltip"; // Import your tooltip component

interface ItemDetails {
  name: string;
  description: string;
  tags: string[];
  items: {
    specificItemId: string;
    price: number;
    location: string;
    maintenanceSchedule: string;
  }[];
}

const ItemDetailsPage = ({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) => {
  const [itemId, setItemId] = useState<string | null>(null);
  const [item, setItem] = useState<ItemDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isEditSpecificItemModalOpen, setIsEditSpecificItemModalOpen] =
    useState<boolean>(false);
  const [specificItemToEdit, setSpecificItemToEdit] = useState<
    ItemDetails["items"][number] | null
  >(null);

  const { permissions } = useUserPermissions(); // Get user permissions

  // Unwrap params and extract itemId
  useEffect(() => {
    async function unwrapParams() {
      const resolvedParams = await params;
      setItemId(resolvedParams.itemId);
    }
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!itemId) return;

    const fetchItem = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/inventory/getItemDetails?itemId=${itemId}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch item details");
        }

        const data: ItemDetails = await response.json();
        setItem(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch item details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  const handleAddSpecificItem = async (newItem: {
    specificItemId: string;
    price: number;
    location: string;
    maintenanceSchedule: string;
  }) => {
    if (!itemId) return;

    try {
      const response = await fetch(
        `/api/inventory/addSpecificItem?itemId=${itemId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to add specific item.");
      }

      const updatedItem: ItemDetails = await response.json();
      setItem(updatedItem); // Update state with the new item data
      toast.success("Specific item added successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to add specific item.");
    }
  };

  const handleEditItem = async (updatedItem: {
    name: string;
    description: string;
    tags: string[];
  }) => {
    if (!itemId) return;

    try {
      const response = await fetch(`/api/inventory/updateItem`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...updatedItem, itemId }),
      });

      if (!response.ok) throw new Error("Failed to update item");

      const updatedData: ItemDetails = await response.json();
      setItem(updatedData); // Update state with new item data
      toast.success("Item updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update item.");
    }
  };

  const handleEditSpecificItem = async (updatedItem: {
    specificItemId: string;
    price: number;
    location: string;
    maintenanceSchedule: string;
  }) => {
    if (!itemId) return;

    try {
      const response = await fetch(`/api/inventory/updateSpecificItem`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...updatedItem, itemId }),
      });

      if (!response.ok) throw new Error("Failed to update specific item");

      const updatedData: ItemDetails = await response.json();
      setItem(updatedData); // Update state with new specific item data
      toast.success("Specific item updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update specific item.");
    }
  };

  const handleDeleteSpecificItem = async (specificItemId: string) => {
    if (!itemId) return;

    try {
      const response = await fetch(
        `/api/inventory/deleteSpecificItem?itemId=${itemId}&specificItemId=${specificItemId}`,
        { method: "DELETE" },
      );

      if (!response.ok) throw new Error("Failed to delete specific item");

      const updatedData: ItemDetails = await response.json();
      setItem(updatedData); // Update state after deletion
      toast.success("Specific item deleted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete specific item.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  const totalValue =
    item?.items.reduce((total, currentItem) => total + currentItem.price, 0) ||
    0;

  const uniqueLocations = item?.items
    ? [...new Set(item.items.map((item) => item.location))]
    : [];

  //Check Permission
  const canEditInventory =
    permissions.includes("can_edit_inventory") ||
    permissions.includes("can_add_inventory") ||
    permissions.includes("admin") ||
    permissions.includes("inventory_manager");
  permissions.includes("procurement_team");

  return (
    <div className="flex min-h-screen bg-gray-50 p-8">
      {/* Left Section: Item Details */}
      <div className="relative w-2/5 pr-8">
        {!canEditInventory ? (
          <button
            className="absolute right-14 top-4 cursor-not-allowed rounded-full p-2 text-gray-300"
            disabled
          >
            <FloatingTooltip message="Permission Required">
              <Edit3 size={20} />
            </FloatingTooltip>
          </button>
        ) : (
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="absolute right-14 top-4 rounded-full p-2 text-gray-500 hover:text-gray-700"
          >
            <Edit3 size={20} />
          </button>
        )}

        <div className="rounded-lg bg-white p-6 shadow">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            {item?.name}
          </h1>
          <p className="flex items-center gap-2 text-gray-600">
            <Info className="h-5 w-5 text-gray-500" />
            {item?.description}
          </p>

          {/* Total Value */}
          <div className="mt-6">
            <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-800">
              <ChartNoAxesCombined className="h-5 w-5 text-green-500" /> Total
              Value:
            </h3>
            <p className="text-xl font-bold text-gray-900">
              RM {totalValue.toLocaleString()}
            </p>
          </div>

          {/* Locations */}
          <div className="mt-6">
            <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-800">
              <MapPin className="h-5 w-5 text-blue-500" /> Locations
            </h3>
            <ul className="list-disc pl-5 text-gray-700">
              {uniqueLocations.map((location, index) => (
                <li key={index}>{location}</li>
              ))}
            </ul>
          </div>

          {/* Tags */}
          <div className="mt-6">
            <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-800">
              <Tag className="h-5 w-5 text-blue-500" /> Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {item?.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Section: Quantity Table */}
      <div className="w-3/5">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Item Details
          </h2>

          <table className="w-full border-collapse border border-gray-200 text-left text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 font-semibold text-gray-700">
                  Specific Item ID
                </th>
                <th className="border px-4 py-2 font-semibold text-gray-700">
                  Price
                </th>
                <th className="border px-4 py-2 font-semibold text-gray-700">
                  Location
                </th>
                <th className="border px-4 py-2 font-semibold text-gray-700">
                  Maintenance
                </th>
                <th className="border px-4 py-2 font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {item?.items.map((itemDetail, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">
                    {itemDetail.specificItemId}
                  </td>
                  <td className="border px-4 py-2">
                    RM {itemDetail.price.toLocaleString()}
                  </td>
                  <td className="border px-4 py-2">{itemDetail.location}</td>
                  <td className="border px-4 py-2">
                    <Calendar className="mr-1 inline-block h-4 w-4 text-blue-500" />
                    {itemDetail.maintenanceSchedule}
                  </td>
                  <td className="border px-4 py-2">
                    {!canEditInventory ? (
                      <FloatingTooltip message="Permission Required">
                        <div className="flex gap-4">
                          <button
                            disabled
                            className="cursor-not-allowed text-blue-300 hover:no-underline"
                          >
                            Update
                          </button>
                          <button
                            disabled
                            className="cursor-not-allowed text-red-300 hover:no-underline"
                          >
                            Delete
                          </button>
                        </div>
                      </FloatingTooltip>
                    ) : (
                      <div className="flex gap-4">
                        <button
                          onClick={() => {
                            setSpecificItemToEdit(itemDetail);
                            setIsEditSpecificItemModalOpen(true);
                          }}
                          className="text-blue-500 hover:underline"
                        >
                          Update
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteSpecificItem(itemDetail.specificItemId)
                          }
                          className="text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Add Specific Item Button */}
        <div className="mt-6">
          {!canEditInventory ? (
            <FloatingTooltip message="Permission Required">
              <button
                className="flex cursor-not-allowed items-center rounded-md bg-gray-200 px-4 py-2 text-gray-400"
                disabled
              >
                <Plus size={20} className="mr-2" />
                Add Item
              </button>
            </FloatingTooltip>
          ) : (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center rounded-md bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
            >
              <Plus size={20} className="mr-2" />
              Add Item
            </button>
          )}
        </div>
      </div>

      {/* Add Specific Item Modal */}
      <AddSpecificItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSpecificItem}
      />

      {/* Edit Item Modal */}
      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditItem}
        initialData={{
          name: item?.name || "",
          description: item?.description || "",
          tags: item?.tags || [],
        }}
      />
      {/* Edit Specific Item Modal */}
      <EditSpecificItemModal
        isOpen={isEditSpecificItemModalOpen}
        onClose={() => setIsEditSpecificItemModalOpen(false)}
        onSubmit={handleEditSpecificItem}
        initialData={
          specificItemToEdit || {
            specificItemId: "",
            price: 0,
            location: "",
            maintenanceSchedule: "",
          }
        }
      />
    </div>
  );
};

export default ItemDetailsPage;
