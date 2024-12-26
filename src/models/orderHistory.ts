import mongoose, { Schema, model, models } from "mongoose";

export const OrderHistorySchema = new Schema({
  orderDate: { type: Date, required: true },
  quantity: { type: Number, required: true },
  description: { type: String, required: true },
  itemDetails: {
    type: [
      {
        specificItemId: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    required: true,
  }, // Details about the items in the order
  supplierClerkId: { type: String, ref: "User", default: null }, // Clerk ID of the supplier from the User model
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
    default: "PENDING",
  }, // Status of the order
  totalAmount: { type: Number, required: true }, // Total cost of the order
});

// Create a standalone OrderHistory model
const OrderHistoryModel =
  models.OrderHistory || model("OrderHistory", OrderHistorySchema);

export default OrderHistoryModel;
