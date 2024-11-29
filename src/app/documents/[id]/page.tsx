'use client';

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { PlateReader } from "@/components/editor/plate-reader";
import { getDocumentById } from "@/app/action/documentActions";

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  const { userId } = useAuth();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      // Redirect to login if userId is not defined
      window.location.href = "/sign-in";
      return;
    }

    async function fetchDocument() {
      try {
        const doc = await getDocumentById(params.id, userId!); // Add non-null assertion `!`
        setDocument(doc);
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDocument();
  }, [userId, params.id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!document) {
    return <p>Document not found</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{document.title}</h1>
      <PlateReader initialContent={document.content} />
    </div>
  );
}
