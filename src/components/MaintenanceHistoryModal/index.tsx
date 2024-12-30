"use client";

import React, { useState } from "react";

interface MaintenanceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  maintenanceType: string[];
  onSave: (
    newDate: string,
    history?: { date: string; maintenanceType: string[] }
  ) => void;
}

const MaintenanceHistoryModal: React.FC<MaintenanceHistoryModalProps> = ({
  isOpen,
  onClose,
  itemId,
  maintenanceType,
  onSave,
}) => {
  const [newDate, setNewDate] = useState<string>("");
  const [updateHistory, setUpdateHistory] = useState<boolean>(true);
  const [newType, setNewType] = useState<string[]>(maintenanceType);

  const handleSave = () => {
    if (updateHistory) {
      const history = {
        date: new Date().toISOString(),
        maintenanceType: newType,
      };
      onSave(newDate, history);
    } else {
      onSave(newDate);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-lg">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Update Maintenance for {itemId}
          </h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Maintenance Date
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="inline-flex items-center text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={updateHistory}
                  onChange={(e) => setUpdateHistory(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2">Automatically update history</span>
              </label>
            </div>

            {updateHistory && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Update Maintenance Type
                </label>
                <input
                  type="text"
                  value={newType.join(", ")}
                  onChange={(e) =>
                    setNewType(
                      e.target.value.split(",").map((t) => t.trim())
                    )
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., Cleaning, Inspection"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceHistoryModal;
