"use client";

import React from "react";
import { IEmployee } from "@/models/Employee";

interface TeamMembersProps {
  teamMembers: IEmployee[];
  onAddTeamMember: () => void;
  onDeleteTeamMember: (employeeId: string) => void;
}

const TeamMembers: React.FC<TeamMembersProps> = ({ teamMembers, onAddTeamMember, onDeleteTeamMember }) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Team Members</h2>
      <button
        onClick={onAddTeamMember}
        className="mb-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Add Team Member
      </button>
      <div className="overflow-y-auto max-h-[150px]">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border border-gray-300 sticky top-0 bg-gray-100">Name</th>
              <th className="p-2 border border-gray-300 sticky top-0 bg-gray-100">Employee ID</th>
              <th className="p-2 border border-gray-300 sticky top-0 bg-gray-100">Role</th>
              <th className="p-2 border border-gray-300 sticky top-0 bg-gray-100">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr key={member.employeeId} className="hover:bg-gray-50">
                <td className="p-2 border border-gray-300">{member.name}</td>
                <td className="p-2 border border-gray-300">{member.employeeId}</td>
                <td className="p-2 border border-gray-300">{member.role}</td>
                <td className="p-2 border border-gray-300">
                  <button
                    onClick={() => onDeleteTeamMember(member.employeeId)} 
                    className="text-red-500 hover:underline"
                  >
                    Remove
                  </button>
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
