"use client";

import React from "react";

interface MaintenanceHistory {
  date: string;
  maintenanceType: string[];
}

interface MaintenanceHistoryListModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: MaintenanceHistory[];
}

const MaintenanceHistoryListModal: React.FC<MaintenanceHistoryListModalProps> = ({
  isOpen,
  onClose,
  history,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-lg">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800">Maintenance History</h3>
          <div className="mt-4">
            {history.length === 0 ? (
              <p className="text-gray-500">No history available.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {history.map((entry, index) => (
                  <li key={index} className="py-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Date:</span>{" "}
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Maintenance Type:</span>{" "}
                      {entry.maintenanceType.join(", ")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceHistoryListModal;
