import mongoose, { Schema, model, models } from "mongoose";

const SupplierSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  materials: { type: [String], default: [] },
});

const SupplierModel = models.Supplier || model("Supplier", SupplierSchema);

export default SupplierModel;
