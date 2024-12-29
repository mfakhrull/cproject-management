"use client";

import { useEffect, useState } from "react";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { EmployeeModal } from "@/components/employees/EmployeeModal";
import { Button } from "@/components/ui/button";
import { IEmployee } from "@/models/Employee";
import { useRouter } from "next/navigation";
import { useUserPermissions } from "@/context/UserPermissionsContext";
import FloatingTooltip from "@/components/FloatingTooltip";

export default function EmployeeDashboard() {
  const router = useRouter();
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { permissions, loading: permissionsLoading } = useUserPermissions();

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees/getemployees");
      const data: IEmployee[] = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const canAccessManagerLeavePage =
    permissions.includes("admin") ||
    permissions.includes("project_manager") ||
    permissions.includes("hr_manager") ||
    permissions.includes("hr_team") ||
    permissions.includes("can_access_manager_leave_page") ||
    permissions.includes("can_approve_leave");

    const handleViewAllApplicationStatus = () => {
      if (!canAccessManagerLeavePage) {
        router.push(`/leaves/employee`);
      } else {
        router.push(`/leaves/manager`);
      }
    };
    


  return (
    <div className="p-4 mx-28">
      {/* Header with Title and Buttons */}
      <div className="mb-4 flex items-center justify-between">
        {/* Left: Title */}
        <h1 className="text-2xl font-bold">Employee Management</h1>

        {/* Right: Button Group */}
        <div className="flex space-x-4">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <span>Add New Employee</span>
          </Button>

          <Button
            onClick={() => handleViewAllApplicationStatus()}
            className="flex items-center space-x-2"
          >
            <span>View Leave Application</span>
          </Button>
        </div>
      </div>
      {loading ? (
        <p>Loading employees...</p>
      ) : (
        <EmployeeTable employees={employees} />
      )}

      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEmployeeAdded={fetchEmployees}
      />
    </div>
  );
}
