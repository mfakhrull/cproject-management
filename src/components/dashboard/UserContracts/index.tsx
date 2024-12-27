"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs"; // Import Clerk's useAuth hook
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Contract {
  _id: string;
  contractType: string;
  overallScore: number;
  username: string;
}

export default function UserContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true); // Track loading state
  const router = useRouter();
  const { userId } = useAuth(); // Get the authenticated user ID

  useEffect(() => {
    async function fetchContracts() {
      if (!userId) return; // Ensure userId is available

      try {
        setLoading(true); // Start loading
        const response = await fetch(`/api/contracts/user-contracts?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch contracts");
        }
        const data = await response.json();
        setContracts(data);
      } catch (error) {
        console.error("Error fetching contracts:", error);
        toast.error("Failed to load contracts. Please try again later.");
      } finally {
        setLoading(false); // End loading
      }
    }
    fetchContracts();
  }, [userId]); // Re-run the effect if userId changes

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-gray-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Button onClick={() => router.push("/dashboard/upload")}>
          Upload New Contract
        </Button>
      </div>

      <div className="rounded-lg border bg-white shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contract ID</TableHead>
              <TableHead>Contract Type</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow
                key={contract._id}
                onClick={() => router.push(`/dashboard/contract/${contract._id}`)}
                className="cursor-pointer hover:bg-gray-50 transition-all"
              >
                <TableCell className="font-medium">{contract.username || "Unknown"}</TableCell>
                <TableCell>{contract._id}</TableCell>
                <TableCell>{contract.contractType}</TableCell>
                <TableCell
                  className={`font-bold ${
                    contract.overallScore > 69
                      ? "text-green-500"
                      : contract.overallScore > 50
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {contract.overallScore}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {contracts.length === 0 && (
        <div className="text-center mt-8 text-gray-600">
          <p>No contracts found.</p>
          <p>Click the "Upload New Contract" button to get started.</p>
        </div>
      )}
    </div>
  );
}
