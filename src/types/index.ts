// types/index.ts
import { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  clerk_id: string;
  username: string;
  profilePictureUrl?: string;
  teamId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeam {
  _id: Types.ObjectId;
  teamName: string;
  productOwnerId: Types.ObjectId;
  projectManagerId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProject {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectTeam {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  teamId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  tags: string[];
  startDate?: Date;
  dueDate?: Date;
  points?: number;
  projectId: Types.ObjectId;
  authorId: Types.ObjectId;
  assignedUserId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment {
  _id: Types.ObjectId;
  text: string;
  taskId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttachment {
  _id: Types.ObjectId;
  fileUrl: string;
  fileName: string;
  taskId: Types.ObjectId;
  uploadedById: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}