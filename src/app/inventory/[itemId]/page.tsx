"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, MapPin, Calendar, Tag, Info, Plus } from "lucide-react";
import AddSpecificItemModal from "@/components/AddSpecificItemModal";
import { toast } from "sonner";

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

const ItemDetailsPage = ({ params }: { params: Promise<{ itemId: string }> }) => {
  const [itemId, setItemId] = useState<string | null>(null);
  const [item, setItem] = useState<ItemDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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
        const response = await fetch(`/api/inventory/getItemDetails?itemId=${itemId}`);
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
      const response = await fetch(`/api/inventory/addSpecificItem?itemId=${itemId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
  
      if (!response.ok) {
        throw new Error("Failed to add specific item.");
      }
  
      const updatedItem: ItemDetails = await response.json();
  
      // Update state with the new item data
      setItem(updatedItem);
      toast.success("Specific item added successfully!");

    } catch (err: any) {
        toast.error(err.message || "Failed to add specific item.");
    }
  };
  

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  const totalValue = item?.items.reduce((total, currentItem) => total + currentItem.price, 0) || 0;

  const uniqueLocations = item?.items
    ? [...new Set(item.items.map((item) => item.location))]
    : [];

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex">
      {/* Left Section: Item Details */}
      <div className="w-2/3 pr-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{item?.name}</h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Info className="h-5 w-5 text-gray-500" />
            {item?.description}
          </p>

          {/* Total Value */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" /> Total Value:
            </h3>
            <p className="text-xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
          </div>

          {/* Locations */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
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
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-500" /> Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {item?.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-lg"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          
        </div>
      </div>

      {/* Right Section: Quantity Table */}
      <div className="w-1/3">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Item Details</h2>

          {/* Quantity Table */}
          <table className="w-full border-collapse border border-gray-200 text-sm text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border font-semibold text-gray-700">Specific Item ID</th>
                <th className="px-4 py-2 border font-semibold text-gray-700">Price</th>
                <th className="px-4 py-2 border font-semibold text-gray-700">Location</th>
                <th className="px-4 py-2 border font-semibold text-gray-700">Maintenance</th>
              </tr>
            </thead>
            <tbody>
              {item?.items.map((itemDetail, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{itemDetail.specificItemId}</td>
                  <td className="px-4 py-2 border">${itemDetail.price.toLocaleString()}</td>
                  <td className="px-4 py-2 border">{itemDetail.location}</td>
                  <td className="px-4 py-2 border">
                    <Calendar className="inline-block h-4 w-4 text-blue-500 mr-1" />
                    {itemDetail.maintenanceSchedule}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Add Specific Item Button */}
        <div className="mt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              <Plus className="mr-2 h-6 w-6" />
              Add Item
            </button>
          </div>
      </div>

      {/* Add Specific Item Modal */}
      <AddSpecificItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSpecificItem}
      />
    </div>
  );
};

export default ItemDetailsPage;
