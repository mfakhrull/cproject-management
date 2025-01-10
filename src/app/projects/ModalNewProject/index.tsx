import Modal from "@/components/Modal";
import React, { useState, useEffect } from "react";
import { formatISO } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onProjectAdded: () => void; // Add a callback for refreshing the sidebar
};

interface IEmployee {
  employeeId: string;
  name: string;
  role: string;
}

const ModalNewProject = ({ isOpen, onClose, onProjectAdded  }: Props) => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("PLANNING");
  const [managerId, setManagerId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<IEmployee[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees/getemployees");
        if (!response.ok) throw new Error("Failed to fetch employees");
        const data: IEmployee[] = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast.error("Error fetching employees");
      }
    };

    fetchEmployees();
  }, []);

  const handleSubmit = async () => {
    if (!projectName || !startDate || !endDate || !location || !managerId) {
      toast.error("All fields are required.");
      return;
    }

    try {
      setIsLoading(true);
      const formattedStartDate = formatISO(new Date(startDate), {
        representation: "complete",
      });
      const formattedEndDate = formatISO(new Date(endDate), {
        representation: "complete",
      });

      const response = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      toast.success("Project created successfully!");
      // Optionally clear the form and close the modal
      setProjectName("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setLocation("");
      setManagerId("");
      setStatus("PLANNING");
      onClose();
      onProjectAdded(); // Call the callback to refresh the sidebar
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Error creating project");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      projectName &&
      description &&
      startDate &&
      endDate &&
      location &&
      managerId
    );
  };

  const selectStyles =
    "mt-2 block w-full rounded-md bg-white px-3 py-2 outline outline-1 outline-gray-300 focus-within:outline-2 focus-within:outline-blue-600 sm:text-base";

  const inputStyles =
    "mt-2 block w-full rounded-md bg-white px-3 py-2 outline outline-1 outline-gray-300 focus-within:outline-2 focus-within:outline-blue-600 sm:text-base";

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Create New Project">
      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div>
          <label
            htmlFor="projectName"
            className="block text-sm font-medium text-gray-900"
          >
            Project Name
          </label>
          <input
            type="text"
            id="projectName"
            name="projectName"
            className={inputStyles}
            placeholder="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-900"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className={inputStyles}
            placeholder="Project Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-900"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputStyles}
            />
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-900"
            >
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputStyles}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-900"
          >
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            className={inputStyles}
            placeholder="Project Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-900"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={selectStyles}
          >
            <option value="PLANNING">Planning</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="managerId"
            className="block text-sm font-medium text-gray-900"
          >
            Project Manager
          </label>
          <select
            id="managerId"
            name="managerId"
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
            className={selectStyles}
          >
            <option value="">Select Project Manager</option>
            {employees.map((employee) => (
              <option key={employee.employeeId} value={employee.employeeId}>
                {employee.name} ({employee.role})
              </option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          disabled={!isFormValid() || isLoading}
          className="mt-6 w-full"
        >
          {isLoading ? "Creating..." : "Create Project"}
        </Button>
      </form>
    </Modal>
  );
};

export default ModalNewProject;
