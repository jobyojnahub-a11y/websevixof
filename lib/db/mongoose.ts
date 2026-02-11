import mongoose from "mongoose";
import { config } from "@/lib/config";

const MONGODB_URI = config.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI. Set it in lib/config.ts");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined;
}

const cached = global.__mongooseCache || { conn: null, promise: null };
global.__mongooseCache = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false }).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

