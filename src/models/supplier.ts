import mongoose, { Schema, model, models } from "mongoose";
import OrderHistoryModel, { OrderHistorySchema } from "./orderHistory";

// Define plain TypeScript interfaces
export interface ComplianceDoc {
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
}

export interface OrderHistory {
  orderDate: string;
  quantity: number;
  description: string;
  status: string;
  totalAmount: number;
}

export interface Supplier {
  name: string;
  email: string;
  phone: string;
  address: string;
  materials: string[];
  complianceDocs: ComplianceDoc[];
  orderHistory: OrderHistory[];
  supplierClerkId: string | null;
}

// Define Mongoose schema
const SupplierSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  materials: { type: [String], default: [] },
  complianceDocs: {
    type: [
      {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        uploadedBy: { type: String, ref: "User", required: true },
      },
    ],
    default: [],
  },
  orderHistory: { type: [OrderHistorySchema], default: [] },
  supplierClerkId: { type: String, ref: "User", default: null },
});

// Create Mongoose model
const SupplierModel = models.Supplier || model("Supplier", SupplierSchema);

// Define interface for Mongoose documents
export interface SupplierDocument extends mongoose.Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  materials: string[];
  complianceDocs: (ComplianceDoc & { _id: mongoose.Types.ObjectId })[];
  orderHistory: OrderHistory[];
  supplierClerkId: string | null;
}

export default SupplierModel;
