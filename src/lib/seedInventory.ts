import mongoose from "mongoose";
import { InventoryItemModel } from "@/models/inventory";
import dbConnect from "./mongodb";

const seedInventory = async () => {
  await dbConnect();

  const seedData = [
    {
      name: "Excavator",
      description: "Heavy-duty machine for construction work.",
      tags: ["Heavy Machinery", "Construction"],
      items: [
        { specificItemId: "A1234", price: 5000, location: "Warehouse A", maintenanceSchedule: "2024-12-01" },
        { specificItemId: "B5678", price: 5200, location: "Warehouse A", maintenanceSchedule: "2024-12-15" },
        { specificItemId: "C9012", price: 5100, location: "Site B", maintenanceSchedule: "2025-01-10" },
      ],
    },
    {
      name: "Cement Bags",
      description: "Essential construction material.",
      tags: ["Materials"],
      items: [
        { specificItemId: "D3456", price: 8, location: "Warehouse C", maintenanceSchedule: "2024-11-30" },
        { specificItemId: "E7890", price: 8, location: "Warehouse C", maintenanceSchedule: "2024-11-30" },
      ],
    },
    {
      name: "Safety Helmets",
      description: "Protective gear for workers.",
      tags: ["Safety", "Equipment"],
      items: [
        { specificItemId: "F1111", price: 20, location: "Warehouse A", maintenanceSchedule: "2024-12-10" },
        { specificItemId: "G2222", price: 20, location: "Warehouse B", maintenanceSchedule: "2024-12-20" },
      ],
    },
  ];

  try {
    // Clear the collection before seeding
    await InventoryItemModel.deleteMany({});
    console.log("Inventory collection cleared.");

    // Seed data
    await InventoryItemModel.insertMany(seedData);
    console.log("Inventory collection seeded successfully.");
  } catch (error) {
    console.error("Error seeding inventory:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

export default seedInventory;
