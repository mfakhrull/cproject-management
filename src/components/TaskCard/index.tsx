// src/components/TaskCard/index.tsx

"use client";

import { ITask, IAttachment } from "@/types";
import { format } from "date-fns";
import Image from "next/image";
import React from "react";

type Props = {
  task: ITask & { attachments?: IAttachment[] }; // Extend ITask to optionally include attachments
  onClick?: () => void; // Optional onClick handler for the task card
};

const TaskCard = ({ task, onClick }: Props) => {
  return (
    <div
      className={`mb-3 rounded bg-white p-4 shadow dark:bg-dark-secondary dark:text-white ${
        onClick ? "cursor-pointer hover:shadow-lg transition-shadow" : ""
      }`}
      onClick={onClick} // Trigger the onClick handler when the card is clicked
    >
      {/* Attachments Section */}
      {task.attachments && task.attachments.length > 0 && (
        <div>
          <strong>Attachments:</strong>
          <div className="flex flex-wrap">
            {task.attachments.map((attachment) => (
              <Image
                key={attachment._id.toString()}
                src={attachment.fileUrl}
                alt={attachment.fileName}
                width={400}
                height={200}
                className="rounded-md"
              />
            ))}
          </div>
        </div>
      )}

      {/* Task Details */}
      <p>
        <strong>ID:</strong> {task._id.toString()}
      </p>
      <p>
        <strong>Title:</strong> {task.title}
      </p>
      <p>
        <strong>Description:</strong>{" "}
        {task.description || "No description provided"}
      </p>
      <p>
        <strong>Status:</strong> {task.status}
      </p>
      <p>
        <strong>Priority:</strong> {task.priority}
      </p>
      <p>
        <strong>Tags:</strong>{" "}
        {task.tags.length > 0 ? task.tags.join(", ") : "No tags"}
      </p>
      <p>
        <strong>Start Date:</strong>{" "}
        {task.startDate ? format(new Date(task.startDate), "P") : "Not set"}
      </p>
      <p>
        <strong>Due Date:</strong>{" "}
        {task.dueDate ? format(new Date(task.dueDate), "P") : "Not set"}
      </p>
      <p>
        <strong>Author:</strong>{" "}
        {task.authorId ? `Author ID: ${task.authorId.toString()}` : "Unknown"}
      </p>
      <p>
        <strong>Assignee:</strong>{" "}
        {task.assignedUserId
          ? `Assignee ID: ${task.assignedUserId.toString()}`
          : "Unassigned"}
      </p>
    </div>
  );
};

export default TaskCard;
