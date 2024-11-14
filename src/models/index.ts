// models/index.ts
import mongoose, { Model } from 'mongoose';
import { 
  IUser, 
  ITeam, 
  IProject, 
  IProjectTeam, 
  ITask, 
  IComment, 
  IAttachment 
} from '../types';

// User Model
const userSchema = new mongoose.Schema({
  clerk_id: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  username: { type: String, required: true },
  profilePictureUrl: String,
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
}, {
  timestamps: true
});

userSchema.index({ username: 'text' });


// Team Model
const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  productOwnerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  projectManagerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, {
  timestamps: true
});

// Project Model
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  startDate: { type: Date, required: true },
  endDate: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

projectSchema.index({ name: 'text', description: 'text' });

// Virtual populate for teams through ProjectTeam
projectSchema.virtual('teams', {
  ref: 'ProjectTeam',
  localField: '_id',
  foreignField: 'projectId'
});

// ProjectTeam Model (Junction table)
const projectTeamSchema = new mongoose.Schema({
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project',
    required: true 
  },
  teamId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team',
    required: true 
  }
}, {
  timestamps: true
});

// Ensure unique project-team combinations
projectTeamSchema.index({ projectId: 1, teamId: 1 }, { unique: true });


// Task Model
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { 
    type: String, 
    enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'],
    default: 'TODO'
  },
  priority: { 
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM'
  },
  tags: [String],
  startDate: Date,
  dueDate: Date,
  points: Number,
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  authorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  assignedUserId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, {
  timestamps: true
});

taskSchema.index({ title: 'text', description: 'text' });


// Comment Model
const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  taskId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Task', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, {
  timestamps: true
});

// Attachment Model
const attachmentSchema = new mongoose.Schema({
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  taskId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Task', 
    required: true 
  },
  uploadedById: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, {
  timestamps: true
});

// Model exports with proper typing
export const User = (mongoose.models.User || mongoose.model<IUser>('User', userSchema)) as Model<IUser>;
export const Team = (mongoose.models.Team || mongoose.model<ITeam>('Team', teamSchema)) as Model<ITeam>;
export const Project = (mongoose.models.Project || mongoose.model<IProject>('Project', projectSchema)) as Model<IProject>;
export const ProjectTeam = (mongoose.models.ProjectTeam || mongoose.model<IProjectTeam>('ProjectTeam', projectTeamSchema)) as Model<IProjectTeam>;
export const Task = (mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema)) as Model<ITask>;
export const Comment = (mongoose.models.Comment || mongoose.model<IComment>('Comment', commentSchema)) as Model<IComment>;
export const Attachment = (mongoose.models.Attachment || mongoose.model<IAttachment>('Attachment', attachmentSchema)) as Model<IAttachment>;