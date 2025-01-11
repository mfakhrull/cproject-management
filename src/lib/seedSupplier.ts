import dbConnect from "@/lib/mongodb";
import SupplierModel from "@/models/supplier";

const seedSuppliers = async () => {
  await dbConnect();

  const suppliers = [
    {
      name: "Alpha Supplies",
      email: "contact@alpha.com",
      phone: "123-456-7890",
      materials: ["Cement", "Steel", "Concrete"],
    },
    {
      name: "Beta Construction Co.",
      email: "sales@betaconstruction.com",
      phone: "987-654-3210",
      materials: ["Gravel", "Bricks", "Sand"],
    },
    {
      name: "Gamma Industrial",
      email: "info@gamma.com",
      phone: "555-123-4567",
      materials: ["Pipes", "Wiring", "Glass"],
    },
  ];

  try {
    await SupplierModel.deleteMany(); // Clear existing suppliers
    await SupplierModel.insertMany(suppliers);
    console.log("Suppliers seeded successfully!");
  } catch (error) {
    console.error("Error seeding suppliers:", error);
  }
};

export default seedSuppliers;
