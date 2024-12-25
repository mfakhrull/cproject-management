"use client";

import React, { useState } from "react";
import { Download, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { IProjectDetailsAttachment } from "@/types";
import FloatingTooltip from "@/components/FloatingTooltip";

interface AttachmentsProps {
  projectId: string;
  attachments: IProjectDetailsAttachment[];
  onFileUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  onDeleteAttachment: (attachmentId: string) => Promise<void>;
  isButtonDisabled?: boolean; // New prop for disabling buttons
}

const Attachments: React.FC<AttachmentsProps> = ({
  projectId,
  attachments,
  onFileUpload,
  isUploading,
  onDeleteAttachment,
  isButtonDisabled = false, // Default to false if not provided
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files?.[0]) {
      setFile(files[0]);
      toast.success(`File "${files[0].name}" selected.`);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      await onFileUpload(file);
      setFile(null);
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload the file.");
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    setIsDeleting(attachmentId); // Indicate which attachment is being deleted

    // Show confirmation toast
    toast("Are you sure you want to delete this file?", {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await onDeleteAttachment(attachmentId);
            toast.success("Attachment deleted successfully!");
          } catch (error) {
            console.error("Error deleting attachment:", error);
            toast.error("Failed to delete attachment.");
          } finally {
            setIsDeleting(null); // Reset deletion state
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {
          setIsDeleting(null); // Simply reset the state
          toast.dismiss(); // Close the confirmation prompt
        },
      },
    });
  };

  const handleDownloadAttachment = (url: string) => {
    window.open(url, "_blank");
    toast.success("Attachment downloading...");
  };

  return (
    <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Attachments</h2>

      {attachments.length ? (
        <ul className="space-y-2">
          {attachments.map((attachment) => (
            <li
              key={attachment._id}
              className="flex items-center justify-between rounded-md bg-gray-100 px-4 py-2 hover:bg-gray-200"
            >
              <span>{attachment.fileName}</span>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleDownloadAttachment(attachment.fileUrl)}
                  className="text-blue-500 hover:underline"
                >
                  <Download className="mr-1 inline-block h-5 w-5" />
                  Download
                </button>
                {isButtonDisabled ? (
                  <FloatingTooltip message="Permission Required">
                    <button
                      onClick={() => handleDeleteAttachment(attachment._id)}
                      className="cursor-not-allowed text-red-500 opacity-50"
                      disabled
                    >
                      <Trash2 className="mr-1 inline-block h-5 w-5" />
                      Delete
                    </button>
                  </FloatingTooltip>
                ) : (
                  <button
                    onClick={() => handleDeleteAttachment(attachment._id)}
                    className="text-red-500 hover:underline"
                  >
                    <Trash2 className="mr-1 inline-block h-5 w-5" />
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No attachments available.</p>
      )}

      <div className="mt-4">
        {/* Dropzone */}
        <div
          className="flex h-32 w-full items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileChange(e.dataTransfer.files);
          }}
        >
          <label
            htmlFor="dropzone-file"
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center"
          >
            <svg
              className="mb-2 h-8 w-8 text-gray-500"
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
            <p className="text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500">PDF only (MAX. 10MB)</p>
          </label>
          <input
            id="dropzone-file"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files)}
          />
        </div>

        {file && (
          <div className="mt-4 flex items-center justify-between rounded-md bg-gray-100 px-4 py-2">
            <span>{file.name}</span>
            <button
              onClick={() => setFile(null)}
              className="text-red-500 hover:underline"
            >
              <XCircle className="mr-1 inline-block h-5 w-5" />
              Remove
            </button>
          </div>
        )}

        {!file || isUploading || isButtonDisabled ? (
          <FloatingTooltip
            message={
              !file
                ? "Select a file to enable uploading"
                : isUploading
                  ? "Uploading in progress"
                  : "Permission Required"
            }
          >
            <button
              onClick={handleFileUpload}
              disabled
              className="mt-4 cursor-not-allowed rounded bg-gray-400 px-4 py-2 text-white"
            >
              {isUploading ? (
                <span className="flex items-center">
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Uploading...
                </span>
              ) : (
                "Upload Attachment"
              )}
            </button>
          </FloatingTooltip>
        ) : (
          <button
            onClick={handleFileUpload}
            className="mt-4 rounded bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
          >
            Upload Attachment
          </button>
        )}
      </div>
    </div>
  );
};

export default Attachments;
