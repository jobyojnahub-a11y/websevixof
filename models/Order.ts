import mongoose, { Schema, type Model } from "mongoose";

export type PackageType = "basic" | "standard" | "premium";
export type OrderStatus = "pending" | "in_discussion" | "in_progress" | "review" | "completed" | "cancelled";
export type Urgency = "Standard (2-3 weeks)" | "Fast (1 week)" | "Rush (3-5 days)";

export interface OrderDoc extends mongoose.Document {
  orderId: string;
  clientId: mongoose.Types.ObjectId;

  package: {
    type: PackageType;
    price: number;
    revisionsAllowed: number;
  };

  projectType: string;
  numberOfPages: number;
  features: string[];
  referenceWebsites?: string;
  additionalInfo?: string;
  hasLogo: boolean;
  hasContent: boolean;
  preferredColors?: string;
  urgency: Urgency;
  urgencyCharge: number;

  status: OrderStatus;

  createdAt: Date;
  acceptedAt?: Date;
  startedAt?: Date;
  expectedDelivery?: Date;
  completedAt?: Date;

  orderFee: number; // 500
  orderFeePaid: boolean;
  orderFeeRazorpayOrderId?: string;
  orderFeeRazorpayPaymentId?: string;

  finalPayment: number;
  finalPaymentPaid: boolean;
  finalPaymentRazorpayOrderId?: string;
  finalPaymentRazorpayPaymentId?: string;

  revisionsAllowed: number;
  revisionsUsed: number;
  revisions: Array<{
    requestedAt: Date;
    description: string;
    completedAt?: Date;
    status: "pending" | "completed";
  }>;

  clientFiles: Array<{
    fileName: string;
    fileUrl: string;
    uploadedAt: Date;
  }>;

  adminFiles: Array<{
    fileName: string;
    fileUrl: string;
    fileType: "mockup" | "draft" | "final";
    uploadedAt: Date;
  }>;

  adminNotes?: string;

  sourceVisitorSessionId?: string;
  conversationId?: mongoose.Types.ObjectId;
}

const OrderSchema = new Schema<OrderDoc>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    package: {
      type: {
        type: String,
        enum: ["basic", "standard", "premium"],
        required: true,
      },
      price: { type: Number, required: true },
      revisionsAllowed: { type: Number, required: true },
    },

    projectType: { type: String, required: true },
    numberOfPages: { type: Number, required: true },
    features: { type: [String], default: [] },
    referenceWebsites: { type: String },
    additionalInfo: { type: String },
    hasLogo: { type: Boolean, required: true },
    hasContent: { type: Boolean, required: true },
    preferredColors: { type: String },
    urgency: { type: String, required: true },
    urgencyCharge: { type: Number, required: true, default: 0 },

    status: {
      type: String,
      enum: ["pending", "in_discussion", "in_progress", "review", "completed", "cancelled"],
      default: "pending",
      index: true,
    },

    acceptedAt: Date,
    startedAt: Date,
    expectedDelivery: Date,
    completedAt: Date,

    orderFee: { type: Number, default: 500 },
    orderFeePaid: { type: Boolean, default: false },
    orderFeeRazorpayOrderId: String,
    orderFeeRazorpayPaymentId: String,

    finalPayment: { type: Number, default: 0 },
    finalPaymentPaid: { type: Boolean, default: false },
    finalPaymentRazorpayOrderId: String,
    finalPaymentRazorpayPaymentId: String,

    revisionsAllowed: { type: Number, default: 0 },
    revisionsUsed: { type: Number, default: 0 },
    revisions: [
      {
        requestedAt: { type: Date, required: true },
        description: { type: String, required: true },
        completedAt: Date,
        status: { type: String, enum: ["pending", "completed"], default: "pending" },
      },
    ],

    clientFiles: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    adminFiles: [
      {
        fileName: String,
        fileUrl: String,
        fileType: { type: String, enum: ["mockup", "draft", "final"], required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    adminNotes: String,
    sourceVisitorSessionId: String,
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation" },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export const Order: Model<OrderDoc> =
  (mongoose.models.Order as Model<OrderDoc>) || mongoose.model<OrderDoc>("Order", OrderSchema);

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  orderId: string;
  packageName: string;
  packageType: 'basic' | 'pro' | 'ecommerce' | 'enterprise';
  basePrice: number;
  addOns: Array<{
    name: string;
    price: number;
  }>;
  discount: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'failed';
  paymentMethod?: 'full' | 'advance';
  paidAmount: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  deliveryDays: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    packageName: {
      type: String,
      required: true,
    },
    packageType: {
      type: String,
      enum: ['basic', 'pro', 'ecommerce', 'enterprise'],
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    addOns: [
      {
        name: String,
        price: Number,
      },
    ],
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['full', 'advance'],
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    deliveryDays: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    features: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
