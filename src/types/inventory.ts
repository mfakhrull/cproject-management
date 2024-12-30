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


export interface SpecificItem {
    specificItemId: string; // Unique ID for the specific item
    price: number; // Price of the specific item
    location: string; // Location of the specific item
    maintenanceSchedule: string; // Maintenance schedule for the specific item
  }
  
