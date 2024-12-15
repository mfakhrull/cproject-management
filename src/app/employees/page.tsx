"use client";

import { useEffect, useState } from "react";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { EmployeeModal } from "@/components/employees/EmployeeModal";
import { Button } from "@/components/ui/button";
import { IEmployee } from "@/models/Employee";

export default function EmployeeDashboard() {
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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Employee Management</h1>
      <Button onClick={() => setIsModalOpen(true)} className="mb-4">Add New Employee</Button>

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
