// src/app/dashboard/bid-opportunities/create/page.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs"; // Import Clerk hook for user ID

const CreateBidOpportunityPage = () => {
  const router = useRouter();
  const { userId } = useAuth(); // Get Clerk user ID for createdBy field
  const [formData, setFormData] = useState({
    projectId: "",
    title: "",
    description: "",
    deadline: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error("You must be logged in to create a bid opportunity.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bids/opportunities/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, createdBy: userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create bid opportunity.");
      }

      toast.success("Bid opportunity created successfully!");
      router.push("/dashboard/bid-opportunities");
    } catch (error: any) {
      toast.error(error.message || "Error creating bid opportunity.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Create Bid Opportunity</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Project ID</label>
          <input
            type="text"
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            required
            placeholder="Enter Project ID"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter Opportunity Title"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide a brief description"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            rows={4}
          ></textarea>
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Deadline</label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-white font-semibold ${
            isSubmitting ? "cursor-not-allowed opacity-50" : "hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Create Bid Opportunity"}
        </button>
      </form>
    </div>
  );
};

export default CreateBidOpportunityPage;
