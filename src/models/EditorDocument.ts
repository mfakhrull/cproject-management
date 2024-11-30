// src/models/EditorDocument.ts
import mongoose from 'mongoose'

export interface IEditorDocument extends mongoose.Document {
  content: any[]
  userId: string
  title?: string
  createdAt?: Date
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
    ref: 'Project',
    required: true,
  },
  title: {
    type: String,
    default: 'Untitled Document',
  },
  deadline: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


export default mongoose.models.EditorDocument || mongoose.model<IEditorDocument>('EditorDocument', EditorDocumentSchema)