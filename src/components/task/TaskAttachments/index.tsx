"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import FloatingTooltip from "@/components/FloatingTooltip"; // Import your tooltip component
import { useUserPermissions } from "@/context/UserPermissionsContext"; // Import the permissions hook

interface Attachment {
  _id: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface TaskAttachmentsProps {
  taskId: string;
  userId: string;
  refreshActivityLog?: () => void; // Callback to refresh the activity log
}

const TaskAttachments: React.FC<TaskAttachmentsProps> = ({
  taskId,
  userId,
  refreshActivityLog,
}) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { permissions } = useUserPermissions(); // Get user permissions

  useEffect(() => {
    // Fetch existing attachments
    const fetchAttachments = async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}/attachments`);
        if (!response.ok) {
          throw new Error("Failed to fetch attachments");
        }
        const data = await response.json();
        setAttachments(data);
      } catch (error) {
        toast.error("Failed to load attachments");
      } finally {
        setLoading(false);
      }
    };

    fetchAttachments();
  }, [taskId]);

  const logAttachmentActivity = async (action: string, fileName: string) => {
    try {
      await fetch(`/api/tasks/attachmentsLog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
          action,
          fileName,
        }),
      });

      // Refresh activity log after successfully logging
      if (refreshActivityLog) {
        refreshActivityLog(); // Ensure activity log updates
      }
    } catch (error) {
      console.error("Failed to log attachment activity:", error);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadedBy", userId);

      const response = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload attachment");
      }

      const newAttachment = await response.json();
      setAttachments((prev) => [...prev, newAttachment]);
      toast.success("File uploaded successfully!");

      // Log the upload activity
      await logAttachmentActivity("uploaded", file.name);
      refreshActivityLog?.(); // Refresh activity log explicitly
    } catch (error) {
      toast.error("File upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFileDrop = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0]; // Handle only the first file for simplicity
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadedBy", userId);

      const response = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload attachment");
      }

      const newAttachment = await response.json();
      setAttachments((prev) => [...prev, newAttachment]);
      toast.success("File uploaded successfully!");

      // Log the upload activity
      await logAttachmentActivity("uploaded", file.name);
      refreshActivityLog?.(); // Refresh activity log explicitly
    } catch (error) {
      toast.error("File upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    const attachmentToDelete = attachments.find(
      (attachment) => attachment._id === attachmentId,
    );

    if (!attachmentToDelete) {
      toast.error("Attachment not found");
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ attachmentId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete attachment");
      }

      setAttachments((prev) =>
        prev.filter((attachment) => attachment._id !== attachmentId),
      );
      toast.success("Attachment deleted");

      // Log the delete activity
      await logAttachmentActivity("deleted", attachmentToDelete.fileName);
      refreshActivityLog?.(); // Refresh activity log explicitly
    } catch (error) {
      toast.error("Failed to delete attachment");
    }
  };

  const canAddAttachments =
    permissions.includes("can_edit_task") ||
    permissions.includes("can_add_attachments") ||
    permissions.includes("admin") ||
    permissions.includes("project_manager");

  return (
    <div className="mt-10">
      <h2 className="text-lg font-medium text-gray-900">Attachments</h2>

      {/* File Dropzone */}
      <div className="mt-4">
        <div
          className={`flex h-56 w-1/3 items-center justify-center rounded-lg border-2 border-dashed ${
            canAddAttachments
              ? "cursor-pointer bg-gray-50 hover:bg-gray-100"
              : "bg-gray-50"
          }`}
          onDragOver={(e) => {
            if (canAddAttachments) e.preventDefault();
          }}
          onDrop={(e) => {
            if (canAddAttachments) {
              e.preventDefault();
              handleFileDrop(e.dataTransfer.files);
            }
          }}
        >
          {!canAddAttachments ? (
            <FloatingTooltip message="Permission Required">
              <label
                htmlFor="dropzone-file"
                className="flex h-full w-full cursor-not-allowed flex-col items-center justify-center"
              >
                <svg
                  className="mb-4 h-8 w-8 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-400">PDF only (MAX. 10MB)</p>
                <input
                  id="dropzone-file"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  disabled
                />
              </label>
            </FloatingTooltip>
          ) : (
            <label
              htmlFor="dropzone-file"
              className="flex h-full w-full cursor-pointer flex-col items-center justify-center"
            >
              <svg
                className="mb-4 h-8 w-8 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500">PDF only (MAX. 10MB)</p>
              <input
                id="dropzone-file"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleFileDrop(e.target.files)}
              />
            </label>
          )}
        </div>
        {uploading && (
          <p className="mt-2 text-sm text-gray-500">Uploading...</p>
        )}
      </div>

      {/* Loader or Empty State */}
      {loading ? (
        <p className="mt-4 text-sm text-gray-500">Loading attachments...</p>
      ) : attachments.length === 0 ? (
        <p className="mt-4 text-gray-500">
          No attachments available for this task.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {attachments.map((attachment) => (
            <li
              key={attachment._id}
              className="flex items-center justify-between border-b pb-2"
            >
              <div>
                <a
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {attachment.fileName}
                </a>
                <p className="text-sm text-gray-500">
                  Uploaded by {attachment.uploadedBy} on{" "}
                  {new Date(attachment.uploadedAt).toLocaleString()}
                </p>
              </div>
              {!canAddAttachments ? (
                <FloatingTooltip message="Permission Required">
                  <Trash2
                    size={20}
                    className="cursor-not-allowed text-gray-300"
                  />
                </FloatingTooltip>
              ) : (
                <Trash2
                  size={20}
                  className="cursor-pointer text-gray-500 hover:text-red-600"
                  onClick={() => handleDelete(attachment._id)}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskAttachments;
