import mongoose, { Schema, model, models } from "mongoose";

// Define plain TypeScript interfaces
export interface ComplianceDoc {
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
}

export interface ProjectHistory {
  projectId: string;
  projectName: string;
  startDate: string;
  endDate: string | null;
  status: string;
  totalCost: number;
}

export interface Contractor {
  name: string;
  email: string;
  phone: string;
  address: string;
  specialties: string[];
  complianceDocs: ComplianceDoc[];
  projectHistory: ProjectHistory[];
  contractorClerkId: string | null;
}

// Define Mongoose schema
const ContractorSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  specialties: { type: [String], default: [] }, // Contractor's area of expertise
  complianceDocs: {
    type: [
      {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        uploadedBy: { type: String, ref: "User", required: true },
      },
    ],
    default: [],
  },
  projectHistory: {
    type: [
      {
        projectId: { type: String, required: true },
        projectName: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, default: null },
        status: {
          type: String,
          enum: ["ONGOING", "COMPLETED", "CANCELLED"],
          default: "ONGOING",
        },
        totalCost: { type: Number, required: true },
      },
    ],
    default: [],
  },
  contractorClerkId: { type: String, ref: "User", default: null },
});

// Create Mongoose model
const ContractorModel =
  models.Contractor || model("Contractor", ContractorSchema);

// Define interface for Mongoose documents
export interface ContractorDocument extends mongoose.Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  specialties: string[];
  complianceDocs: (ComplianceDoc & { _id: mongoose.Types.ObjectId })[];
  projectHistory: ProjectHistory[];
  contractorClerkId: string | null;
}

export default ContractorModel;
