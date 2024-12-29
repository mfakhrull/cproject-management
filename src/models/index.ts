// models/index.ts
import mongoose, { Model } from "mongoose";
import {
  IUser,
  ITeam,
  IProject,
  IProjectTeam,
  ITask,
  IComment,
  IAttachment,
  IMaterialRequest,
  IProjectDetailsAttachment,
} from "../types";

// User Model
const userSchema = new mongoose.Schema(
  {
    clerk_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: { type: String, required: true },
    profilePictureUrl: String,
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    employeeId: { type: String, default: null }, // New field to store employeeId
    role: { type: String, default: "employee" }, // New field to store the role (e.g., "admin", "manager", "employee")
    rolePermissions: {
      type: [String], // Array of permission keys
      default: [], // Example: ["inventory", "projects", "employees"]
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ username: "text" });

// Project Details Attachment Subdocument Schema
const projectDetailsAttachmentSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedBy: {
      type: String,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Material Request Schema
const materialRequestSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    requestedBy: {
      type: String,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REVISION_REQUIRED"],
      default: "PENDING",
    },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        priority: {
          type: String,
          enum: ["LOW", "MEDIUM", "HIGH"],
          default: "MEDIUM",
        },
      },
    ],
    notes: String,
  },
  { timestamps: true },
);

// Team Model
const teamSchema = new mongoose.Schema(
  {
    teamName: { type: String, required: true },
    productOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Project Schema
const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    startDate: { type: Date, required: true },
    endDate: Date,
    extendedDate: Date, // New Field
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ["PLANNING", "IN_PROGRESS", "COMPLETED"], // Existing statuses
      default: "PLANNING",
    },
    bidStatus: {
      type: String,
      enum: ["OPEN", "CLOSED"], // New statuses for bid opportunities
      default: "OPEN",
    },
    assignedContractorId: {
      type: String, // Clerk user ID of the assigned contractor
      ref: "User",
      default: null,
    },
    managerId: {
      type: String,
      ref: "User",
      required: true,
    },
    teamMembers: [
      {
        type: String,
        ref: "Employee",
      },
    ],
    attachments: [projectDetailsAttachmentSchema],
    materialRequests: [materialRequestSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

projectSchema.index({ name: "text", description: "text" });

// Virtual populate for teams through ProjectTeam
projectSchema.virtual("teams", {
  ref: "ProjectTeam",
  localField: "_id",
  foreignField: "projectId",
});

// Virtual for teamMembers to link to Employee, not User
projectSchema.virtual("teamMembersInfo", {
  ref: "Employee", // 👈 Reference Employee instead of User
  localField: "teamMembers", 
  foreignField: "employeeId", // 👈 Employee's employeeId field
  justOne: false, 
});

projectSchema.virtual("attachmentsInfo", {
  ref: "User",
  localField: "attachments.uploadedBy", // Clerk user IDs stored as strings
  foreignField: "clerk_id", // Clerk ID in the User model
  justOne: true, // Single user
});

projectSchema.virtual("materialRequestsInfo", {
  ref: "User",
  localField: "materialRequests.requestedBy", // Clerk user IDs stored as strings
  foreignField: "clerk_id", // Clerk ID in the User model
  justOne: true, // Single user
});

// ProjectTeam Model (Junction table)
const projectTeamSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Ensure unique project-team combinations
projectTeamSchema.index({ projectId: 1, teamId: 1 }, { unique: true });

// Task Model
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "COMPLETED"],
      default: "TODO",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    tags: [String],
    startDate: Date,
    dueDate: Date,
    timeEstimate: String, // Changed to string to allow "2h 3m"
    points: Number,
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    authorId: {
      type: String, // Updated to string (clerk_id)
      required: true,
    },
    assignedUserIds: [
      {
        type: String, // Clerk IDs of assignees
        required: true,
      },
    ], // Changed to an array of strings
    attachments: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        uploadedBy: { type: String, required: true }, // Clerk ID of uploader
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);


taskSchema.index({ title: "text", description: "text" });

// Comment Model
const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Attachment Model
const attachmentSchema = new mongoose.Schema(
  {
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    uploadedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Model exports with proper typing
export const User = (mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema)) as Model<IUser>;
export const Team = (mongoose.models.Team ||
  mongoose.model<ITeam>("Team", teamSchema)) as Model<ITeam>;
export const MaterialRequest = (mongoose.models.MaterialRequest ||
  mongoose.model<IMaterialRequest>(
    "MaterialRequest",
    materialRequestSchema,
  )) as Model<IMaterialRequest>;
export const Project = (mongoose.models.Project ||
  mongoose.model<IProject>("Project", projectSchema)) as Model<IProject>;
export const ProjectTeam = (mongoose.models.ProjectTeam ||
  mongoose.model<IProjectTeam>(
    "ProjectTeam",
    projectTeamSchema,
  )) as Model<IProjectTeam>;
export const Task = (mongoose.models.Task ||
  mongoose.model<ITask>("Task", taskSchema)) as Model<ITask>;
export const Comment = (mongoose.models.Comment ||
  mongoose.model<IComment>("Comment", commentSchema)) as Model<IComment>;
export const Attachment = (mongoose.models.Attachment ||
  mongoose.model<IAttachment>(
    "Attachment",
    attachmentSchema,
  )) as Model<IAttachment>;
