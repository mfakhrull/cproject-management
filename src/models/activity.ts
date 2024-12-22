import mongoose, { Schema, Document, Model } from "mongoose";

// Define the Activity interface
export interface IActivity extends Document {
  taskId: mongoose.Schema.Types.ObjectId; // Reference to the task
  type: "timeTracking" | "comment" | "statusChange" | "system" | "custom"; // Type of activity
  text?: string; // Optional text for some activity types
  user?: {
    userId: string;
    name: string;
    avatar?: string;
  }; // User details for activities like comments
  duration?: number; // For time tracking activities (in seconds)
  timestamp: Date; // Time of the activity
}

// Define the Activity schema
const activitySchema = new Schema<IActivity>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    type: {
      type: String,
      enum: ["timeTracking", "comment", "statusChange", "system", "custom"],
      required: true,
    },
    text: { type: String },
    user: {
      userId: { type: String },
      name: { type: String },
      avatar: { type: String },
    },
    duration: { type: Number }, // Duration in seconds for time tracking
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  },
);

// Create the Activity model
const Activity =
  mongoose.models.Activity ||
  mongoose.model<IActivity>("Activity", activitySchema);

export default Activity;
