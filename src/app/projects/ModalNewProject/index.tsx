// src\app\projects\ModalNewProject\index.tsx
import Modal from "@/components/Modal";
import React, { useState, useEffect } from "react";
import { formatISO } from "date-fns";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

interface IEmployee {
  employeeId: string;
  name: string;
  role: string;
}

const ModalNewProject = ({ isOpen, onClose }: Props) => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("PLANNING");
  const [managerId, setManagerId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<IEmployee[]>([]);

  useEffect(() => {
    // Fetch the list of employees
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees/getemployees");
        if (!response.ok) throw new Error("Failed to fetch employees");
        const data: IEmployee[] = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setError("Error fetching employees");
      }
    };

    fetchEmployees();
  }, []);

  const handleSubmit = async () => {
    if (!projectName || !startDate || !endDate || !location || !managerId) return;

    const formattedStartDate = formatISO(new Date(startDate), {
      representation: "complete",
    });
    const formattedEndDate = formatISO(new Date(endDate), {
      representation: "complete",
    });

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/projects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: projectName,
          description,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          location,
          status,
          managerId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      // Optionally clear the form and close the modal
      setProjectName("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setLocation("");
      setManagerId("");
      setStatus("PLANNING");
      onClose();
    } catch (error: any) {
      console.error("Error creating project:", error);
      setError(error.message || "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return projectName && description && startDate && endDate && location && managerId;
  };

  const inputStyles =
    "w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none";

  const selectStyles =
    "mb-4 block w-full rounded border border-gray-300 px-3 py-2 dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none";

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Create New Project">
      <form
        className="mt-4 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          type="text"
          className={inputStyles}
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <textarea
          className={inputStyles}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <input
            type="date"
            className={inputStyles}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className={inputStyles}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <input
          type="text"
          className={inputStyles}
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <select
          className={selectStyles}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="PLANNING">Planning</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select
          className={selectStyles}
          value={managerId}
          onChange={(e) => setManagerId(e.target.value)}
        >
          <option value="">Select Project Manager</option>
          {employees.map((employee) => (
            <option key={employee.employeeId} value={employee.employeeId}>
              {employee.name} ({employee.role})
            </option>
          ))}
        </select>
        {error && <div className="text-red-500">{error}</div>}
        <button
          type="submit"
          className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
            !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? "Creating..." : "Create Project"}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNewProject;
