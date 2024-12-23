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
  parentCommentId?: mongoose.Schema.Types.ObjectId; // Optional reference to parent comment for threading
}

// Define the Activity schema
const activitySchema = new Schema<IActivity>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    type: {
      type: String,
      enum: ["timeTracking", "attachment", "comment", "statusChange", "system", "custom", "fileAction"], // Added "fileAction"
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
    parentCommentId: { type: Schema.Types.ObjectId, ref: "Activity" }, // For threading
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
