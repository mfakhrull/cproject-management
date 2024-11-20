export interface InventoryItem {
    _id: string;
    name: string;
    location: string;
    quantity: number;
    tags: string[];
    items: SpecificItem[]; // Array of specific items
  }
  
  export interface ItemDetails {
    _id: string;
    name: string;
    description: string;
    tags: string[];
    items: {
      specificItemId: string; // Unique ID for each specific item
      price: number;
      location: string;
      maintenanceSchedule: string; // Maintenance schedule info
    }[];
  }

  // src/types/inventory.ts

export interface SpecificItem {
    specificItemId: string; // Unique ID for the specific item
    price: number; // Price of the specific item
    location: string; // Location of the specific item
    maintenanceSchedule: string; // Maintenance schedule for the specific item
  }
  
//   export interface InventoryItem {
//     _id: string; // Unique MongoDB ObjectId as a string
//     name: string; // Name of the inventory item
//     description: string; // Description of the inventory item
//     tags: string[]; // Array of tags for the inventory item
//     items: SpecificItem[]; // Array of specific items
//   }
  
  