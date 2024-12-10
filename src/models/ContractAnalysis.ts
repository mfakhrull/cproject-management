// src/models/ContractAnalysis.ts

import mongoose, { Schema, Document } from "mongoose";

interface IRisk {
  risk: string;
  explanation: string;
  severity: "low" | "medium" | "high";
}

interface IOpportunity {
  opportunity: string;
  explanation: string;
  impact: "low" | "medium" | "high";
}

interface IFinancialTerms {
  description: string;
  details: string[];
}

export interface IContractAnalysis extends Document {
  userId: string; // Changed from mongoose.Types.ObjectId to string for Clerk user ID
  contractText: string;
  risks: IRisk[];
  opportunities: IOpportunity[];
  summary: string;
  recommendations: string[];
  keyClauses: string[];
  legalCompliance: string;
  negotiationPoints: string[];
  contractDuration: string;
  terminationConditions: string;
  overallScore: number;
  language: string;
  aiModel: string;
  contractType: string;
  attachments: { fileName: string; fileUrl: string }[];
  financialTerms: IFinancialTerms;
  performanceMetrics: string[];
  specificClauses: string;
}

const ContractAnalysisSchema: Schema = new Schema({
  userId: { type: String, required: true }, // Changed to String
  contractText: { type: String, required: true },
  risks: [{ risk: String, explanation: String, severity: String }],
  opportunities: [{ opportunity: String, explanation: String, impact: String }],
  summary: { type: String, required: true },
  recommendations: [{ type: String }],
  keyClauses: [{ type: String }],
  legalCompliance: { type: String },
  negotiationPoints: [{ type: String }],
  contractDuration: { type: String },
  terminationConditions: { type: String },
  overallScore: { type: Number, min: 0, max: 100 },
  language: { type: String, default: "en" },
  aiModel: { type: String, default: "gemini-1.5-pro" },
  contractType: { type: String, required: true },
  attachments: [
    {
      fileName: { type: String, required: true },
      fileUrl: { type: String, required: true },
    },
  ],
  financialTerms: {
    description: { type: String, default: "" },
    details: [{ type: String }],
  },
  performanceMetrics: [{ type: String }],
  specificClauses: { type: String, default: "" },
});

export default mongoose.models.ContractAnalysis ||
  mongoose.model<IContractAnalysis>("ContractAnalysis", ContractAnalysisSchema);
