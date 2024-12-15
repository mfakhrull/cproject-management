import mongoose, { Schema, Document } from "mongoose";

export interface ILeave extends Document {
  leaveId: string; // Unique leave request ID
  employeeId: string | { name: string; role?: string }; // Allow for populated data
  startDate: Date;
  endDate: Date;
  leaveType: "Sick" | "Vacation" | "Emergency";
  status: "Pending" | "Approved" | "Rejected";
  reason: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveSchema: Schema = new Schema(
  {
    leaveId: { type: String, required: true, unique: true },
    employeeId: { type: String, required: true }, // Use String type for user ID
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    leaveType: { 
      type: String, 
      enum: ["Sick", "Vacation", "Emergency"], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["Pending", "Approved", "Rejected"], 
      default: "Pending" 
    },
    reason: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Leave || mongoose.model<ILeave>("Leave", LeaveSchema);
