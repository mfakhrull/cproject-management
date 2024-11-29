// src/models/BidSubmission.ts

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBidSubmission extends Document {
  bidOpportunityId: mongoose.Schema.Types.ObjectId; // Reference to BidOpportunity
  contractorId: string; // Clerk user ID of the contractor
  price: number;
  timeline: string; // Proposed timeline in weeks or months
  proposalUrl: string; // URL to the uploaded proposal document
  status: "PENDING" | "APPROVED" | "REJECTED";
  comments?: string; // Optional feedback or notes
  createdAt: Date;
  updatedAt: Date;
}

const BidSubmissionSchema: Schema = new Schema(
  {
    bidOpportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BidOpportunity",
      required: true,
    },
    contractorId: { type: String, required: true }, // Clerk user ID
    price: { type: Number, required: true },
    timeline: { type: String, required: true },
    proposalUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    comments: { type: String },
  },
  { timestamps: true }
);

export const BidSubmission = mongoose.models.BidSubmission ||
  mongoose.model<IBidSubmission>("BidSubmission", BidSubmissionSchema);
