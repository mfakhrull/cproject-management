// src\models\Bid.ts
import mongoose, { Document } from 'mongoose';

export interface IBid extends Document {
  projectId: mongoose.Types.ObjectId;
  contractorId: string; // Clerk user ID
  price: number;
  timeline: string;
  attachments: { fileName: string; fileUrl: string }[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt?: Date;
  updatedAt?: Date;
}

const BidSchema = new mongoose.Schema<IBid>(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    contractorId: {
      type: String,
      ref: 'User',
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    timeline: {
      type: String,
      required: true,
    },
    attachments: [
      {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        uploadedBy: { type: String, ref: 'User', required: true }, // Add uploadedBy
      },
    ],
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Bid || mongoose.model<IBid>('Bid', BidSchema);
