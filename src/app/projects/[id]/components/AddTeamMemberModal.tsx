"use client";

import React, { useEffect, useState } from "react";
import { IEmployee } from "@/models/Employee";

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (employeeId: string) => void;
}

const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({ isOpen, onClose, onAddMember }) => {
  const [employees, setEmployees] = useState<IEmployee[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees/getemployees');
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    if (isOpen) fetchEmployees();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Team Member</h2>
        <ul className="space-y-2">
          {employees.map((employee) => (
            <li key={employee.employeeId} className="flex justify-between">
              <span>{employee.name} ({employee.role})</span>
              <button
                onClick={() => onAddMember(employee.employeeId)} 
                className="text-blue-500 hover:underline"
              >
                Add
              </button>
            </li>
          ))}
        </ul>
        <button onClick={onClose} className="mt-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">
          Close
        </button>
      </div>
    </div>
  );
};

export default AddTeamMemberModal;
