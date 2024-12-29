"use client";

import React, { useEffect, useState } from "react";

interface AssigneesModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string; // Pass the task ID to fetch assignees
}

interface Assignee {
  clerk_id: string;
  username: string;
  role?: string;
}

const AssigneesModal: React.FC<AssigneesModalProps> = ({
  isOpen,
  onClose,
  taskId,
}) => {
  const [assigneesDetails, setAssigneesDetails] = useState<Assignee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchAssignees = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/users/getAssignees?taskId=${taskId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch assignee details.");
        }

        const data: Assignee[] = await response.json();
        setAssigneesDetails(data);
      } catch (err: any) {
        setError(err.message || "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignees();
  }, [isOpen, taskId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold text-gray-800">Assignees</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>
        <div className="p-4">
          {loading ? (
            <p className="text-sm text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : assigneesDetails.length > 0 ? (
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Username
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody>
                {assigneesDetails.map((assignee) => (
                  <tr key={assignee.clerk_id}>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">
                      {assignee.username}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">
                      {assignee.role || "No Role"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-600">No assignees available.</p>
          )}
        </div>
        <div className="border-t p-4 text-right">
          <button
            onClick={onClose}
            className="rounded bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssigneesModal;
