"use client";

import { useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { MoreVertical, Trash2, Info, Eye } from "lucide-react";
import { toast } from "sonner";
import { useTaskContext } from "@/context/TaskContext";

type TaskActionsMenuProps = {
  taskId: string;
  openPeek: (taskId: string) => void; // For opening peek view
  openFullScreen: (taskId: string) => void;
};

const TaskActionsMenu = ({
  taskId,
  openPeek,
  openFullScreen,
}: TaskActionsMenuProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteTask } = useTaskContext(); // 🔥 Call deleteTask from the context

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteTask(taskId); // 🔥 Call the context function
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-neutral-500">
        <MoreVertical size={18} />
      </Menu.Button>

      <Transition
        as="div"
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-36 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-dark-secondary">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-gray-100 dark:bg-gray-700" : ""
                  } flex w-full items-center px-3 py-2 text-sm text-gray-700 dark:text-white`}
                  onClick={() => openPeek(taskId)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Peek
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-gray-100 dark:bg-gray-700" : ""
                  } flex w-full items-center px-3 py-2 text-sm text-gray-700 dark:text-white`}
                  onClick={() => openFullScreen(taskId)}
                >
                  <Info className="mr-2 h-4 w-4" />
                  Details
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-red-100 dark:bg-gray-700" : ""
                  } flex w-full items-center px-3 py-2 text-sm text-red-600`}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default TaskActionsMenu;
