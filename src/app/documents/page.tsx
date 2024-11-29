"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUserDocuments } from "@/app/action/documentActions";

export default function DocumentsPage() {
  const { userId } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      // Redirect to login if userId is null or undefined
      window.location.href = "/sign-in";
      return;
    }

    async function fetchDocuments() {
      try {
        const docs = await getUserDocuments(userId!); // Add non-null assertion `!`
        setDocuments(docs);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, [userId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Opportunities</h1>
      {documents.length === 0 ? (
        <p>No documents found</p>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Link
              key={doc._id}
              href={`/documents/${doc._id}`}
              className="block p-4 border rounded hover:bg-gray-100 transition"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{doc.title}</h2>
                <span className="text-gray-500">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
