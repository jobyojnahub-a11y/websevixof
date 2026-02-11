import mongoose, { Schema, type Model } from "mongoose";

export type UserRole = "client" | "admin";

export interface UserDoc extends mongoose.Document {
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string;
  whatsapp?: string;
  businessName?: string;
  role: UserRole;
  createdAt: Date;
  lastLogin?: Date;
}

const UserSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, trim: true },
    businessName: { type: String, trim: true },
    role: { type: String, enum: ["client", "admin"], default: "client", required: true, index: true },
    lastLogin: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export const User: Model<UserDoc> = (mongoose.models.User as Model<UserDoc>) || mongoose.model<UserDoc>("User", UserSchema);

