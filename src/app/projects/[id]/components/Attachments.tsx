"use client";

import React, { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { IProjectDetailsAttachment } from "@/types";

interface AttachmentsProps {
  attachments: IProjectDetailsAttachment[];
  onFileUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

const Attachments: React.FC<AttachmentsProps> = ({
  attachments,
  onFileUpload,
  isUploading,
}) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
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

      // Clear the file input
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload the file.");
    }
  };

  const handleDownloadAttachment = (url: string) => {
    window.open(url, "_blank");
    toast.success("Attachment downloading...");
  };

  return (
    <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">
        Attachments
      </h2>
      {attachments.length ? (
        <ul className="space-y-2">
          {attachments.map((attachment, index) => (
            <li
              key={attachment._id}
              className="flex items-center justify-between rounded-md bg-gray-100 px-4 py-2 hover:bg-gray-200"
            >
              <span>{attachment.fileName}</span>
              <button
                onClick={() => handleDownloadAttachment(attachment.fileUrl)}
                className="text-blue-500 hover:underline"
              >
                <Download className="mr-1 inline-block h-5 w-5" />
                Download
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No attachments available.</p>
      )}

      <div className="mt-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full rounded-md border p-2"
          disabled={isUploading}
        />
        <button
          onClick={handleFileUpload}
          disabled={!file || isUploading}
          className={`mt-2 rounded px-4 py-2 text-white ${
            !file || isUploading
              ? "cursor-not-allowed bg-gray-400"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isUploading ? (
            <span className="flex items-center">
              <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
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
      </div>
    </div>
  );
};

export default Attachments;
