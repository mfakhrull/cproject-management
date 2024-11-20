// types/index.ts
export interface IUser {
  _id: string; // MongoDB ObjectId is now a string
  clerk_id: string;
  username: string;
  profilePictureUrl?: string;
  teamId?: string; // Updated to string for consistency
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeam {
  _id: string;
  teamName: string;
  productOwnerId: string;
  projectManagerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProject {
  _id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectTeam {
  _id: string;
  projectId: string;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  tags: string[];
  startDate?: Date;
  dueDate?: Date;
  points?: number;
  projectId: string;
  authorId: string; // Updated to string (clerk_id)
  assignedUserId?: string; // Updated to string (clerk_id)
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment {
  _id: string;
  text: string;
  taskId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttachment {
  _id: string;
  fileUrl: string;
  fileName: string;
  taskId: string;
  uploadedById: string;
  createdAt: Date;
  updatedAt: Date;
}
