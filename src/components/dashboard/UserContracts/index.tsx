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

interface Contract {
  _id: string;
  contractType: string;
  overallScore: number;
}

export default function UserContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const router = useRouter();
  const { userId } = useAuth(); // Get the authenticated user ID

  useEffect(() => {
    async function fetchContracts() {
      if (!userId) return; // Ensure userId is available

      try {
        // Include userId in the query parameters
        const response = await fetch(`/api/contracts/user-contracts?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch contracts");
        }
        const data = await response.json();
        setContracts(data);
      } catch (error) {
        console.error("Error fetching contracts:", error);
      }
    }
    fetchContracts();
  }, [userId]); // Re-run the effect if userId changes

  return (
    <div>
      <Button className="mb-4" onClick={() => router.push("/dashboard/upload")}>
        Upload New Contract
      </Button>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
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
                className="cursor-pointer hover:bg-gray-100"
              >
                <TableCell>{contract._id}</TableCell>
                <TableCell>{contract.contractType}</TableCell>
                <TableCell>{contract.overallScore}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
