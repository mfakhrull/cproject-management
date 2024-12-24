// src/models/Employee.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IWorkHistory {
  projectId: string;
  role: string;
  startDate: Date;
  endDate?: Date;
}

interface IAvailability {
  hoursPerWeek: number;
  shiftPreference: "Morning" | "Evening" | "Night";
  vacationDaysRemaining: number;
}

interface IContact {
  email: string;
  phone: string;
}

export interface IEmployee extends Document {
  _id: string; // Add _id here to ensure TypeScript recognizes it
  employeeId: string;
  name: string;
  role: string;
  rolePermissions: string[]; // New field for role permissions
  contact: IContact;
  workHistory: IWorkHistory[];
  availability: IAvailability;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema: Schema = new Schema(
  {
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    rolePermissions: {
      type: [String], // Array of strings to store role permissions
      default: [], // Example: ["inventory", "projects", "employees"]
    },
    contact: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    workHistory: [
      {
        projectId: { type: String, required: true },
        role: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
      },
    ],
    availability: {
      hoursPerWeek: { type: Number, required: true },
      shiftPreference: {
        type: String,
        enum: ["Morning", "Evening", "Night"],
        required: true,
      },
      vacationDaysRemaining: { type: Number, required: true },
    },
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

export default mongoose.models.Employee ||
  mongoose.model<IEmployee>("Employee", EmployeeSchema);
