"use client";

import Modal from "@/components/Modal";
import React, { useState, useEffect } from "react";
import { formatISO } from "date-fns";
import { toast } from "sonner";
import { useTaskContext } from "@/context/TaskContext"; // Import the context

type Props = {
  isOpen: boolean;
  onClose: () => void;
  projectId: string; // Pass projectId directly
};

interface IUser {
  clerk_id: string; // Use clerk_id
  username: string;
}

const ModalNewTask = ({ isOpen, onClose, projectId }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("TODO");
  const [priority, setPriority] = useState("MEDIUM");
  const [tags, setTags] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [authorUserId, setAuthorUserId] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<IUser[]>([]);

  const { fetchTasks } = useTaskContext(); // Access fetchTasks from context

  useEffect(() => {
    // Fetch the list of users
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users/getUsers");
        if (!response.ok) throw new Error("Failed to fetch users");
        const data: IUser[] = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Error fetching users");
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async () => {
    if (!title || !authorUserId || !projectId) {
      toast.error("Title, Author, and Project ID are required.");
      return;
    }

    try {
      setIsLoading(true);
      const formattedStartDate = startDate
        ? formatISO(new Date(startDate), { representation: "complete" })
        : null;
      const formattedDueDate = dueDate
        ? formatISO(new Date(dueDate), { representation: "complete" })
        : null;

      const response = await fetch("/api/tasks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          status,
          priority,
          tags: tags.split(",").map((tag) => tag.trim()),
          startDate: formattedStartDate,
          dueDate: formattedDueDate,
          authorUserId,
          assignedUserId,
          projectId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      toast.success("Task created successfully!");
      fetchTasks(projectId); // Refresh tasks via context
      onClose(); // Close the modal on success
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Error creating task");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return title && authorUserId && projectId;
  };

  const selectStyles =
    "mb-4 block w-full rounded border border-gray-300 px-3 py-2 dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none";

  const inputStyles =
    "w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none";

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Create New Task">
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
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className={inputStyles}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <select
            className={selectStyles}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">Work In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <select
            className={selectStyles}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        <input
          type="text"
          className={inputStyles}
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
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
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <select
          className={selectStyles}
          value={authorUserId}
          onChange={(e) => setAuthorUserId(e.target.value)}
        >
          <option value="">Select Author</option>
          {users.map((user) => (
            <option key={user.clerk_id} value={user.clerk_id}>
              {user.username}
            </option>
          ))}
        </select>
        <select
          className={selectStyles}
          value={assignedUserId}
          onChange={(e) => setAssignedUserId(e.target.value)}
        >
          <option value="">Select Assignee</option>
          {users.map((user) => (
            <option key={user.clerk_id} value={user.clerk_id}>
              {user.username}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
            !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? "Creating..." : "Create Task"}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNewTask;
