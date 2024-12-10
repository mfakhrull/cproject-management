"use client";

import { UploadModal } from "@/components/modals/UploadModal";

export default function UploadPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">Upload Contract</h1>
      <UploadModal isOpen={true} onClose={() => {}} onUploadComplete={() => {}} />
    </div>
  );
}
