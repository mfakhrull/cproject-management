// types/index.ts
export interface IUser {
  _id: string; // MongoDB ObjectId is now a string
  clerk_id: string;
  username: string;
  profilePictureUrl?: string;
  teamId?: string; // Updated to string for consistency
  employeeId?: string; // New field to reference the employee
  role?: string; // New field to store the role (e.g., "admin", "manager", "employee")
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

export interface IMaterialRequest {
  _id: string; // MongoDB ObjectId
  projectId: string; // MongoDB ObjectId (reference to the project)
  requestedBy: string; // User ID of the requester
  status: 'PENDING' | 'APPROVED' | 'REVISION_REQUIRED';
  items: {
    name: string;
    quantity: number;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
  }[];
  notes?: string; // Optional notes from the requester or procurement team
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectDetailsAttachment {
  _id: string; // MongoDB ObjectId
  fileName: string;
  fileUrl: string;
  uploadedBy: string; // User ID of the uploader
  createdAt: Date;
}


export interface IProject {
  _id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location: string; // New field
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED'; // New field
  managerId: string; // User ID of the project manager
  teamMembers: string[]; // User IDs of team members
  attachments: IProjectDetailsAttachment[]; // Project-related attachments
  materialRequests: IMaterialRequest[]; // Material requests associated with the project
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

