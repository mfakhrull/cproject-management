"use client";

import { useEffect, useState } from "react";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { EmployeeModal } from "@/components/employees/EmployeeModal";
import { Button } from "@/components/ui/button";
import { IEmployee } from "@/models/Employee";
import { useRouter } from "next/navigation";

export default function EmployeeDashboard() {
  const router = useRouter();
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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

  const handleViewAllApplicationStatus = () => {
    router.push(`/leaves/manager`);
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
