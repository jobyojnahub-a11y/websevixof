import mongoose, { Schema, type Model } from "mongoose";

export type VisitorStatus = "active" | "idle" | "left";

export interface VisitorSessionDoc extends mongoose.Document {
  sessionId: string;
  visitorId: string;

  ipAddress?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  os?: string;

  landingPage: string;
  currentPage: string;
  referrer?: string;
  referrerType?: "search" | "direct" | "social" | "email" | "referral";
  searchTerm?: string;

  sessionStart: Date;
  lastActivity: Date;
  timeOnSite: number;
  status: VisitorStatus;

  pagesVisited: Array<{ page: string; timestamp: Date; timeSpent?: number }>;
  actions: Array<{ action: string; element?: string; timestamp: Date }>;

  scrollDepth: Record<string, number>;
  engagementScore: number;
  isReturning: boolean;
  visitCount: number;

  chatInitiated: boolean;
  connectedWithAdmin: boolean;
  adminConnectionOffered: boolean;
  adminConnectionResponse: "accepted" | "declined" | "pending" | "none";
  conversationId?: mongoose.Types.ObjectId;

  orderFormStarted: boolean;
  orderFormStep: number;
  orderCompleted: boolean;
  convertedToClientId?: mongoose.Types.ObjectId;
}

const VisitorSessionSchema = new Schema<VisitorSessionDoc>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    visitorId: { type: String, required: true, index: true },

    ipAddress: String,
    country: String,
    city: String,
    device: String,
    browser: String,
    os: String,

    landingPage: { type: String, required: true },
    currentPage: { type: String, required: true },
    referrer: String,
    referrerType: { type: String },
    searchTerm: String,

    sessionStart: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now, index: true },
    timeOnSite: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "idle", "left"], default: "active", index: true },

    pagesVisited: [
      {
        page: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        timeSpent: Number,
      },
    ],
    actions: [
      {
        action: { type: String, required: true },
        element: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],

    scrollDepth: { type: Schema.Types.Mixed, default: {} },
    engagementScore: { type: Number, default: 0, index: true },
    isReturning: { type: Boolean, default: false },
    visitCount: { type: Number, default: 1 },

    chatInitiated: { type: Boolean, default: false },
    connectedWithAdmin: { type: Boolean, default: false },
    adminConnectionOffered: { type: Boolean, default: false },
    adminConnectionResponse: {
      type: String,
      enum: ["accepted", "declined", "pending", "none"],
      default: "none",
    },
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation" },

    orderFormStarted: { type: Boolean, default: false },
    orderFormStep: { type: Number, default: 0 },
    orderCompleted: { type: Boolean, default: false },
    convertedToClientId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const VisitorSession: Model<VisitorSessionDoc> =
  (mongoose.models.VisitorSession as Model<VisitorSessionDoc>) ||
  mongoose.model<VisitorSessionDoc>("VisitorSession", VisitorSessionSchema);

