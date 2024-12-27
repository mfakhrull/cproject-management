"use client";

import { useState } from "react";
import { UploadModal } from "@/components/modals/UploadModal";
import { toast } from "sonner"; // Import Sonner's toast

export default function UploadPage() {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-8 mt-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Contract</h1>
        <p className="mt-2 text-gray-600">
          Use this tool to upload and analyze your contract documents. The file should be in PDF format and will be processed securely.
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-xl font-semibold text-gray-800">Instructions</h2>
        <ol className="mt-4 space-y-3 text-gray-700">
          <li>
            <span className="font-medium">Step 1:</span> Click the "Open Upload Modal" button to start.
          </li>
          <li>
            <span className="font-medium">Step 2:</span> Select a PDF file from your device.
          </li>
          <li>
            <span className="font-medium">Step 3:</span> Follow the prompts to upload, detect, and analyze the contract.
          </li>
        </ol>

        <button
          onClick={handleOpen}
          className="mt-6 w-full rounded-md bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
        >
          Open Upload Modal
        </button>
      </div>

      <UploadModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onUploadComplete={() => toast.success("Analyze Success!")}
      />
    </div>
  );
}
