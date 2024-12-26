import mongoose, { Schema, model, models } from "mongoose";
import OrderHistoryModel, { OrderHistorySchema } from "./orderHistory";

interface ComplianceDoc {
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  _id: mongoose.Types.ObjectId;
}

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
  supplierClerkId: { type: String, ref: "User", default: null }, // Add supplierClerkId
});

const SupplierModel = models.Supplier || model("Supplier", SupplierSchema);

export interface SupplierDocument extends Document {
  complianceDocs: ComplianceDoc[];
}

export default SupplierModel;
