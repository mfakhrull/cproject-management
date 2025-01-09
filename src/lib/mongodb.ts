import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable inside .env.local");
}

interface ICached {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

// Extend the NodeJS global type
declare global {
  namespace NodeJS {
    interface Global {
      mongoose: ICached;
    }
  }
}

// Ensure the extended property is used
declare const global: NodeJS.Global;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<mongoose.Connection> {
  if (cached.conn) {
    console.log("MongoDB already connected"); // Log if already connected
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      dbName: "project-management",
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      console.log("MongoDB connected successfully"); // Log on successful connection
      return mongoose.connection;
    }).catch((err) => {
      console.error("MongoDB connection failed:", err.message); // Log error on failure
      throw err; // Re-throw error to handle it upstream
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
