"use client";

import Modal from "@/components/Modal";
import React, { useState, useEffect } from "react";
import { formatISO } from "date-fns";
import { toast } from "sonner";
import { useTaskContext } from "@/context/TaskContext"; // Import the context
import { Button } from "@/components/ui/button"; // Assuming you have a shared Button component

type Props = {
  isOpen: boolean;
  onClose: () => void;
  projectId: string; // Pass projectId directly
};

interface IUser {
  clerk_id: string; // Use clerk_id
  username: string;
  role: string;
  profilePictureUrl: string;
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
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
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
          assignedUserIds,
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
    "mt-2 block w-full rounded-md bg-white px-3 py-2 outline outline-1 outline-gray-300 focus-within:outline-2 focus-within:outline-blue-600 sm:text-base";

  const inputStyles =
    "mt-2 block w-full rounded-md bg-white px-3 py-2 outline outline-1 outline-gray-300 focus-within:outline-2 focus-within:outline-blue-600 sm:text-base";

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Create New Task">
      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-900"
          >
            Task Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className={inputStyles}
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
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
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-900"
            >
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={selectStyles}
            >
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-gray-900"
          >
            Tags (comma separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            className={inputStyles}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Task tags"
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
              htmlFor="dueDate"
              className="block text-sm font-medium text-gray-900"
            >
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputStyles}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="authorUserId"
            className="block text-sm font-medium text-gray-900"
          >
            Author
          </label>
          <select
            id="authorUserId"
            name="authorUserId"
            value={authorUserId}
            onChange={(e) => setAuthorUserId(e.target.value)}
            className={selectStyles}
          >
            <option value="">Select Author</option>
            {users.map((user) => (
              <option key={user.clerk_id} value={user.clerk_id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="assignedUserIds"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Assignees
          </label>

          {/* Select Dropdown */}
          <div className="flex gap-2">
            <select
              id="assignedUserIds"
              name="assignedUserIds"
              onChange={(e) => {
                const selectedValue = e.target.value;
                if (selectedValue && !assignedUserIds.includes(selectedValue)) {
                  setAssignedUserIds([...assignedUserIds, selectedValue]);
                }
              }}
              className={`${selectStyles} w-full`}
              value=""
            >
              <option value="" disabled>
                Select Assignee
              </option>
              {users
                .filter((user) => !assignedUserIds.includes(user.clerk_id)) // Exclude already selected users
                .map((user) => (
                  <option key={user.clerk_id} value={user.clerk_id}>
                    {user.username} ({user.role || "No Role"})
                  </option>
                ))}
            </select>
          </div>

          {/* Selected Assignees List */}
          <ul className="mt-4 space-y-2">
            {assignedUserIds.map((userId) => {
              const user = users.find((u) => u.clerk_id === userId);
              return (
                <li
                  key={userId}
                  className="flex items-center justify-between rounded-lg border border-gray-300 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200">
                      {user?.profilePictureUrl && (
                        <img
                          src={user.profilePictureUrl}
                          alt={user.username || "User"}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {user?.username || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user?.role || "No Role"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setAssignedUserIds(
                        assignedUserIds.filter((id) => id !== userId),
                      )
                    }
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <Button
          type="submit"
          disabled={!isFormValid() || isLoading}
          className="mt-6 w-full"
        >
          {isLoading ? "Creating..." : "Create Task"}
        </Button>
      </form>
    </Modal>
  );
};

export default ModalNewTask;
