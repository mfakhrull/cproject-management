"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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

export function UploadModal({ isOpen, onClose, onUploadComplete }: UploadModalProps) {
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setFile(event.target.files[0]);
      setError(null);
    }
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
      if (!data.uploadResult || !data.uploadResult.secure_url) {
        throw new Error("Invalid response from server: Missing secure_url");
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
      setError("No file URL found.");
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      console.log("Sending fileUrl to API:", fileUrl);
  
      const response = await fetch("/api/contracts/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });
  
      console.log("Response status:", response.status);
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(errorData.error || "Failed to detect contract type.");
      }
  
      const data: DetectTypeResponse = await response.json();
      console.log("Detected contract type:", data.detectedType);
  
      setContractType(data.detectedType);
      setStep("confirm");
    } catch (err: any) {
      console.error("Error in detectContractType:", err.message);
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
      setError(err.message || "Failed to upload and analyze contract.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case "upload":
        return (
          <div className="text-center">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full mb-4"
            />
            <Button onClick={uploadFileToCloudinary} disabled={loading || !file}>
              {loading ? "Uploading..." : "Upload File"}
            </Button>
          </div>
        );
      case "uploaded":
        return (
          <div className="text-center">
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
            <Button onClick={uploadAndAnalyzeContract}>Yes, Analyze</Button>
            <Button variant="outline" onClick={() => setStep("upload")} className="mt-4">
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {renderStepContent()}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
