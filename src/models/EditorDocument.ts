// src/models/EditorDocument.ts
import mongoose from "mongoose";
import { Project } from "@/models"; // Import the Project model

export interface IEditorDocument extends mongoose.Document {
  content: any[];
  userId: string;
  projectId: mongoose.Types.ObjectId;
  title?: string;
  deadline?: Date;
  status?: string; // New field for status
  assignedContractorId?: string; // Optional field for assigned contractor
  createdAt?: Date;
}

const EditorDocumentSchema = new mongoose.Schema({
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  title: {
    type: String,
    default: "Untitled Document",
  },
  deadline: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["OPEN", "CLOSED"], // Status can be either "OPEN" or "CLOSED"
    default: "OPEN",
  },
  assignedContractorId: {
    type: String, // Clerk user ID of the assigned contractor
    ref: "User",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.EditorDocument ||
  mongoose.model<IEditorDocument>("EditorDocument", EditorDocumentSchema);
