// src/models/EditorDocument.ts
import mongoose from "mongoose";

export interface IEditorDocument extends mongoose.Document {
  content: any[];
  userId: string;
  projectId: mongoose.Types.ObjectId;
  title?: string;
  deadline?: Date;
  status?: string;
  assignedContractorId?: string;
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
    ref: "Project", // Just use the string reference, no need to import Project
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
    enum: ["OPEN", "CLOSED"],
    default: "OPEN",
  },
  assignedContractorId: {
    type: String,
    ref: "User",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add this if you need any virtual populate
EditorDocumentSchema.virtual('project', {
  ref: 'Project',
  localField: 'projectId',
  foreignField: '_id',
  justOne: true
});

const EditorDocument = mongoose.models.EditorDocument || mongoose.model<IEditorDocument>("EditorDocument", EditorDocumentSchema);
export default EditorDocument;