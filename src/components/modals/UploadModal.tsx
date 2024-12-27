"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, XCircle } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

interface UploadResponse {
  uploadResult: {
    secure_url: string;
    public_id: string;
  };
}

interface DetectTypeResponse {
  detectedType: string;
}

export function UploadModal({
  isOpen,
  onClose,
  onUploadComplete,
}: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [contractType, setContractType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"upload" | "uploaded" | "detecting" | "confirm" | "done">(
    "upload"
  );
  const router = useRouter();
  const { userId } = useAuth();

  const handleFileChange = (files: FileList | null) => {
    const selectedFile = files?.[0];
    if (!selectedFile) {
      setError("No file selected.");
      return;
    }
    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }
    setFile(selectedFile);
    setError(null);
  };

  const uploadFileToCloudinary = async () => {
    if (!file) {
      setError("No file selected.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("contract", file);

      const response = await fetch("/api/contracts/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("File upload failed: " + errorText);
      }

      const data: UploadResponse = await response.json();
      if (!data.uploadResult?.secure_url) {
        throw new Error("Invalid server response: Missing secure_url.");
      }
      setFileUrl(data.uploadResult.secure_url);
      setStep("uploaded");
    } catch (err: any) {
      setError(err.message || "Failed to upload file.");
    } finally {
      setLoading(false);
    }
  };

  const detectContractType = async () => {
    if (!fileUrl) {
      setError("File URL is missing.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/contracts/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to detect contract type.");
      }

      const data: DetectTypeResponse = await response.json();
      setContractType(data.detectedType);
      setStep("confirm");
    } catch (err: any) {
      setError(err.message || "Failed to detect contract type.");
    } finally {
      setLoading(false);
    }
  };

  const uploadAndAnalyzeContract = async () => {
    if (!userId || !contractType || !fileUrl) {
      setError("Missing required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("contractType", contractType);
      formData.append("fileUrl", fileUrl);
      formData.append("userId", userId);

      const response = await fetch("/api/contracts/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze contract.");
      }

      setStep("done");
      onUploadComplete();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to analyze contract.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case "upload":
        return (
          <div className="text-center pt-8">
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
                  <span className="font-semibold">Click to upload</span> or drag and drop
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

            {/* File Preview */}
            {file && (
              <div className="mt-4 flex items-center justify-between rounded-md bg-gray-100 px-4 py-2">
                <span className="text-gray-700">{file.name}</span>
                <button
                  onClick={() => setFile(null)}
                  className="text-red-500 hover:underline flex items-center"
                >
                  <XCircle className="mr-1 h-5 w-5" />
                  Remove
                </button>
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={uploadFileToCloudinary}
              disabled={loading || !file}
              className={`mt-4 rounded ${
                loading || !file
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-slate-800 text-white hover:bg-slate-700"
              } px-4 py-2`}
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </span>
              ) : (
                "Upload File"
              )}
            </Button>
          </div>
        );
      case "uploaded":
        return (
          <div className="text-center pb-4">
            <p>File uploaded successfully!</p>
            <Button onClick={detectContractType} disabled={loading}>
              {loading ? "Detecting..." : "Detect Contract Type"}
            </Button>
          </div>
        );
      case "detecting":
        return (
          <div className="text-center">
            <Loader2 className="animate-spin text-gray-500 size-16 mx-auto" />
            <p className="mt-4">Detecting contract type...</p>
          </div>
        );
      case "confirm":
        return (
          <div className="text-center">
            <p>
              Detected contract type: <strong>{contractType}</strong>
            </p>
            <p>Would you like to analyze this contract?</p>
            <Button onClick={uploadAndAnalyzeContract} disabled={loading}>
              {loading ? "Analyzing..." : "Yes, Analyze"}
            </Button>
            <Button variant="outline" onClick={() => setStep("upload")} className="mt-4 ml-4">
              No, Try Another File
            </Button>
          </div>
        );
      case "done":
        return (
          <div className="text-center">
            <p>Analysis complete! View the results on your dashboard.</p>
            <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        {renderStepContent()}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
