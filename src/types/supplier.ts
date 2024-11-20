export interface Supplier {
    _id: string; // MongoDB ObjectId as a string
    name: string;
    email: string;
    phone: string;
    materials: string[];
  }
  