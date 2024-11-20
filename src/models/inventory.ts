import mongoose, { Schema, model, models } from "mongoose";

const ItemSchema = new Schema({
  specificItemId: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  maintenanceSchedule: { type: String, required: true },
});

const InventoryItemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  tags: { type: [String], default: [] },
  items: { type: [ItemSchema], required: true },
});

export const InventoryItemModel =
  models.InventoryItem || model("InventoryItem", InventoryItemSchema);
