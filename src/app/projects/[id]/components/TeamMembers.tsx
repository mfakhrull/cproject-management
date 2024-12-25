"use client";

import React from "react";
import { IEmployee } from "@/models/Employee";
import FloatingTooltip from "@/components/FloatingTooltip"; // Import the tooltip component

interface TeamMembersProps {
  teamMembers: IEmployee[];
  onAddTeamMember: () => void;
  onDeleteTeamMember: (employeeId: string) => void;
  isButtonDisabled?: boolean; // New prop for disabling buttons
}

const TeamMembers: React.FC<TeamMembersProps> = ({
  teamMembers,
  onAddTeamMember,
  onDeleteTeamMember,
  isButtonDisabled = false, // Default to false if not provided
}) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Team Members</h2>

      {/* Add Team Member Button */}
      {isButtonDisabled ? (
        <FloatingTooltip message="Permission Required">
          <button
            onClick={onAddTeamMember}
            className="mb-4 rounded px-4 py-2 cursor-not-allowed bg-gray-200 text-gray-400"
            disabled
          >
            Add Team Member
          </button>
        </FloatingTooltip>
      ) : (
        <button
          onClick={onAddTeamMember}
          className="mb-4 rounded px-4 py-2 bg-slate-900 text-white hover:bg-slate-700"
        >
          Add Team Member
        </button>
      )}

      <div className="max-h-[150px] overflow-y-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="sticky top-0 border border-gray-300 bg-gray-100 p-2">
                Name
              </th>
              <th className="sticky top-0 border border-gray-300 bg-gray-100 p-2">
                Employee ID
              </th>
              <th className="sticky top-0 border border-gray-300 bg-gray-100 p-2">
                Role
              </th>
              <th className="sticky top-0 border border-gray-300 bg-gray-100 p-2">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr key={member.employeeId} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2">{member.name}</td>
                <td className="border border-gray-300 p-2">
                  {member.employeeId}
                </td>
                <td className="border border-gray-300 p-2">{member.role}</td>
                <td className="border border-gray-300 p-2">
                  {isButtonDisabled ? (
                    <FloatingTooltip message="Permission Required">
                      <button
                        onClick={() => onDeleteTeamMember(member.employeeId)}
                        className="text-red-500 cursor-not-allowed opacity-50"
                        disabled
                      >
                        Remove
                      </button>
                    </FloatingTooltip>
                  ) : (
                    <button
                      onClick={() => onDeleteTeamMember(member.employeeId)}
                      className="text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamMembers;
