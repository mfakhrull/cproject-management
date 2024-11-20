// src/app/projects/BoardView/index.tsx

"use client";

import React, { useRef, useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop, DropTargetMonitor } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { EllipsisVertical, Plus } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { ITask } from "@/types";
import { useTaskContext } from "@/context/TaskContext";
import TaskDetailsWrapper from "../tasks/TaskDetailsWrapper";

type BoardProps = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const taskStatus: ITask["status"][] = ["TODO", "IN_PROGRESS", "COMPLETED"];

const BoardView = ({ id, setIsModalNewTaskOpen }: BoardProps) => {
  const { tasks, fetchTasks, updateTaskStatus, isLoading, error } = useTaskContext();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTasks(id); // Fetch tasks for the given project ID
  }, [id, fetchTasks]);

  const moveTask = async (taskId: string, toStatus: ITask["status"]) => {
    await updateTaskStatus(taskId, toStatus); // Use the context method to update the task status
  };

  const openTaskDetails = (taskId: string) => {
    setSelectedTaskId(taskId); // Open side peek for task details
  };

  const openFullScreen = (taskId: string) => {
    router.push(`/projects/${id}/tasks/${taskId}`); // Redirect to full-screen task details
  };

  const closeTaskDetails = () => {
    setSelectedTaskId(null);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
        {taskStatus.map((status) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={tasks}
            moveTask={moveTask}
            setIsModalNewTaskOpen={setIsModalNewTaskOpen}
            openTaskDetails={openTaskDetails}
            openFullScreen={openFullScreen}
          />
        ))}
      </div>

      {selectedTaskId && (
        <TaskDetailsWrapper
          taskId={selectedTaskId}
          mode="peek" // Always use "peek" for side layout
          onClose={closeTaskDetails}
        />
      )}
    </DndProvider>
  );
};

type TaskColumnProps = {
  status: ITask["status"];
  tasks: ITask[];
  moveTask: (taskId: string, toStatus: ITask["status"]) => void;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  openTaskDetails: (taskId: string) => void;
  openFullScreen: (taskId: string) => void;
};

const TaskColumn = ({
  status,
  tasks,
  moveTask,
  setIsModalNewTaskOpen,
  openTaskDetails,
  openFullScreen,
}: TaskColumnProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop({
    accept: "task",
    drop: (item: { id: string }) => moveTask(item.id, status),
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drop(ref);

  const filteredTasks = tasks.filter((task) => task.status === status);
  const statusColor: Record<string, string> = {
    TODO: "#2563EB",
    IN_PROGRESS: "#059669",
    COMPLETED: "#000000",
  };

  return (
    <div
      ref={ref}
      className={`sl:py-4 rounded-lg py-2 xl:px-2 ${
        isOver ? "bg-blue-100 dark:bg-neutral-950" : ""
      }`}
    >
      <div className="mb-3 flex w-full">
        <div
          className={`w-2 rounded-s-lg`}
          style={{ backgroundColor: statusColor[status] }}
        />
        <div className="flex w-full items-center justify-between rounded-e-lg bg-white px-5 py-4 dark:bg-dark-secondary">
          <h3 className="flex items-center text-lg font-semibold dark:text-white">
            {status}
            <span
              className="ml-2 inline-block rounded-full bg-gray-200 p-1 text-center text-sm leading-none dark:bg-dark-tertiary"
              style={{ width: "1.5rem", height: "1.5rem" }}
            >
              {filteredTasks.length}
            </span>
          </h3>
          <div className="flex items-center gap-1">
            <button className="flex h-6 w-5 items-center justify-center dark:text-neutral-500">
              <EllipsisVertical size={26} />
            </button>
            <button
              className="flex h-6 w-6 items-center justify-center rounded bg-gray-200 dark:bg-dark-tertiary dark:text-white"
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {filteredTasks.map((task) => (
        <Task
          key={task._id.toString()}
          task={task}
          openTaskDetails={openTaskDetails}
          openFullScreen={openFullScreen}
        />
      ))}
    </div>
  );
};

type TaskProps = {
  task: ITask;
  openTaskDetails: (taskId: string) => void;
  openFullScreen: (taskId: string) => void;
};

const Task = ({ task, openTaskDetails, openFullScreen }: TaskProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: "task",
    item: { id: task._id.toString() },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(ref);

  const formattedStartDate = task.startDate
    ? format(new Date(task.startDate), "P")
    : "";
  const formattedDueDate = task.dueDate ? format(new Date(task.dueDate), "P") : "";

  return (
    <div
      ref={ref}
      className={`mb-4 rounded-md bg-white shadow dark:bg-dark-secondary ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      onClick={() => openTaskDetails(task._id.toString())}
    >
      <div className="p-4 md:p-6">
        <h4 className="text-md font-bold dark:text-white">{task.title}</h4>
        <p className="text-sm text-gray-600 dark:text-neutral-500">
          {task.description}
        </p>
        <div className="text-xs text-gray-500 dark:text-neutral-500">
          {formattedStartDate && <span>{formattedStartDate} - </span>}
          {formattedDueDate && <span>{formattedDueDate}</span>}
        </div>
      </div>
    </div>
  );
};

export default BoardView;
