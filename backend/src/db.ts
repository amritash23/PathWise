import mongoose from "mongoose";

export async function connectToDatabase(mongoUri: string) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
}

