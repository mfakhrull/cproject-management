// src/models/BidOpportunity.ts

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBidOpportunity extends Document {
  projectId: mongoose.Schema.Types.ObjectId; // Reference to the Project
  title: string;
  description?: Record<string, any>; // JSON structure for Editor.js output
  deadline: Date;
  createdBy: string; // Clerk user ID of the project manager
  createdAt: Date;
  updatedAt: Date;
}

const BidOpportunitySchema: Schema = new Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: Schema.Types.Mixed }, // Supports JSON data
    deadline: { type: Date, required: true },
    createdBy: { type: String, required: true }, // Clerk user ID
  },
  { timestamps: true }
);

export const BidOpportunity = mongoose.models.BidOpportunity ||
  mongoose.model<IBidOpportunity>("BidOpportunity", BidOpportunitySchema);
