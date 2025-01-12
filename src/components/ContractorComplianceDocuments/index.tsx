"use client";

import React, { useState } from "react";
import { Download, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useUserPermissions } from "@/context/UserPermissionsContext"; // Import the hook
import FloatingTooltip from "@/components/FloatingTooltip"; // Import your tooltip component

interface ComplianceDocument {
  _id: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
}

interface ContractorComplianceDocumentsProps {
  contractorId: string;
  complianceDocs: ComplianceDocument[];
  onFileUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  onDeleteDocument: (docId: string) => Promise<void>;
}

const ContractorComplianceDocuments: React.FC<ContractorComplianceDocumentsProps> = ({
  contractorId,
  complianceDocs,
  onFileUpload,
  isUploading,
  onDeleteDocument,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const { permissions } = useUserPermissions(); // Get user permissions

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

  const handleDownloadDocument = (url: string) => {
    window.open(url, "_blank");
    toast.success("Downloading document...");
  };

  // Check Permission
  const canEditInventory =
    permissions.includes("can_edit_inventory") ||
    permissions.includes("can_add_inventory") ||
    permissions.includes("admin") ||
    permissions.includes("inventory_manager") ||
    permissions.includes("procurement_team");

  return (
    <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">
        Contractor Compliance Documents
      </h2>

      {complianceDocs.length ? (
        <ul className="space-y-2">
          {complianceDocs.map((doc) => (
            <li
              key={doc._id}
              className="flex items-center justify-between rounded-md bg-gray-100 px-4 py-2 hover:bg-gray-200"
            >
              <span>{doc.fileName}</span>
              <div className="flex items-center space-x-4">
                {!canEditInventory ? (
                  <button
                    className="cursor-not-allowed text-blue-500 opacity-50 hover:underline"
                    disabled
                  >
                    <FloatingTooltip message="Permission Required">
                      <Download className="mr-1 inline-block h-5 w-5" />
                      Download
                    </FloatingTooltip>
                  </button>
                ) : (
                  <button
                    onClick={() => handleDownloadDocument(doc.fileUrl)}
                    className="text-blue-500 hover:underline"
                  >
                    <Download className="mr-1 inline-block h-5 w-5" />
                    Download
                  </button>
                )}

                {!canEditInventory ? (
                  <button
                    className="cursor-not-allowed text-red-500 opacity-50 hover:underline"
                    disabled
                  >
                    <FloatingTooltip message="Permission Required">
                      <Trash2 className="mr-1 inline-block h-5 w-5" />
                      Delete
                    </FloatingTooltip>
                  </button>
                ) : (
                  <button
                    onClick={() => onDeleteDocument(doc._id)}
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
        <p className="text-gray-600">No compliance documents available.</p>
      )}

      <div className="mt-4">
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

        <div className="group relative mt-4">
          {!canEditInventory ? (
            <button
              className="cursor-not-allowed rounded bg-slate-800 px-4 py-2 text-white opacity-50"
              disabled
            >
              <FloatingTooltip message="Permission Required">
                Upload Document
              </FloatingTooltip>
            </button>
          ) : (
            <button
              onClick={handleFileUpload}
              className={`rounded bg-slate-800 px-4 py-2 text-white hover:bg-slate-700 ${
                !file || isUploading ? "cursor-not-allowed opacity-50" : ""
              }`}
              disabled={!file || isUploading}
            >
              {!file ? (
                <FloatingTooltip message="Select a file to enable uploading">
                  {isUploading ? "Uploading..." : "Upload Document"}
                </FloatingTooltip>
              ) : isUploading ? (
                <FloatingTooltip message="Uploading in progress">
                  Uploading...
                </FloatingTooltip>
              ) : (
                "Upload Document"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractorComplianceDocuments;
