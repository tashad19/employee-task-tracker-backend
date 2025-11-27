import mongoose from "mongoose";
import { log } from "../index";
import dotenv from "dotenv"
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

export async function connectDB(): Promise<void> {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("Missing MONGO_URI")
    }
    mongoose.connect(process.env.MONGO_URI)

    log("MongoDB connected successfully", "mongodb");
  } catch (error) {
    log(`MongoDB connection error: ${error}`, "mongodb");
    throw error;
  }
}

mongoose.connection.on("disconnected", () => {
  log("MongoDB disconnected", "mongodb");
});

mongoose.connection.on("error", (err) => {
  log(`MongoDB error: ${err}`, "mongodb");
});

export default mongoose;
