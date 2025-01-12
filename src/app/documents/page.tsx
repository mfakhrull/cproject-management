"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

export default function DocumentsPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchOpportunities() {
      try {
        const response = await fetch("/api/documents/getOpenOpportunities");
        if (!response.ok) {
          throw new Error("Failed to fetch open opportunities");
        }

        const docs = await response.json();
        setOpportunities(docs);
        setFilteredOpportunities(docs); // Initialize filtered list
      } catch (error) {
        console.error("Error fetching opportunities:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOpportunities();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);

    const filtered = opportunities.filter((opportunity) =>
      opportunity.title.toLowerCase().includes(searchValue) ||
      opportunity.projectId?.name?.toLowerCase().includes(searchValue) ||
      opportunity.status.toLowerCase().includes(searchValue)
    );

    setFilteredOpportunities(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 text-lg">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Open Bid Opportunities</h1>
      </div>

      {/* Search */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex w-full items-center rounded-md bg-white p-2 shadow-sm">
          <Search size={16} className="mr-2 text-gray-400" />
          <input
            type="text"
            placeholder="Search opportunities..."
            className="w-full outline-none"
            value={searchTerm}
            onChange={handleSearch} // Search handler
          />
        </div>
      </div>

      {/* Opportunities List */}
      {filteredOpportunities.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 text-lg">No open opportunities found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOpportunities.map((opportunity) => (
            <Link
              key={opportunity._id}
              href={`/documents/${opportunity._id}`}
              className="block rounded-md bg-white p-4 shadow transition hover:shadow-lg"
            >
              <h2 className="mb-2 text-lg font-semibold text-gray-800">
                {opportunity.title}
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium text-gray-700">Project:</span>{" "}
                  {opportunity.projectId?.name || "N/A"}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Status:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      opportunity.status === "OPEN"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {opportunity.status}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-gray-700">Deadline:</span>{" "}
                  {new Date(opportunity.deadline).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Created:</span>{" "}
                  {new Date(opportunity.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
