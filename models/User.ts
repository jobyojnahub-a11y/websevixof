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

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  domainName?: string;
  accountStatus: 'pending' | 'active' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    businessType: {
      type: String,
      required: true,
      enum: [
        'E-commerce/Retail',
        'Manufacturing',
        'Healthcare/Clinic',
        'Education/Coaching',
        'Restaurant/Food',
        'Real Estate/Construction',
        'IT/Software',
        'Photography/Creative',
        'Legal/CA Services',
        'Other',
      ],
    },
    domainName: {
      type: String,
      trim: true,
    },
    accountStatus: {
      type: String,
      enum: ['pending', 'active', 'suspended'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
