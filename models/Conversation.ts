import mongoose, { Schema, type Model } from "mongoose";

export type ParticipantType = "visitor" | "client" | "order";
export type ConversationStatus = "active" | "resolved" | "archived";
export type ConversationPriority = "low" | "medium" | "high" | "urgent";

export interface ConversationDoc extends mongoose.Document {
  conversationId: string;

  participantType: ParticipantType;
  visitorSessionId?: string;
  clientId?: mongoose.Types.ObjectId;
  orderId?: string;
  adminId?: mongoose.Types.ObjectId;

  status: ConversationStatus;
  priority: ConversationPriority;

  createdAt: Date;
  lastMessageAt?: Date;

  unreadCountAdmin: number;
  unreadCountClient: number;

  tags: string[];
  convertedToOrder: boolean;
  conversionOrderId?: string;
}

const ConversationSchema = new Schema<ConversationDoc>(
  {
    conversationId: { type: String, required: true, unique: true, index: true },

    participantType: { type: String, enum: ["visitor", "client", "order"], required: true, index: true },
    visitorSessionId: { type: String, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    orderId: { type: String, index: true },
    adminId: { type: Schema.Types.ObjectId, ref: "User", index: true },

    status: { type: String, enum: ["active", "resolved", "archived"], default: "active", index: true },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium", index: true },

    lastMessageAt: { type: Date },
    unreadCountAdmin: { type: Number, default: 0 },
    unreadCountClient: { type: Number, default: 0 },

    tags: { type: [String], default: [] },
    convertedToOrder: { type: Boolean, default: false },
    conversionOrderId: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export const Conversation: Model<ConversationDoc> =
  (mongoose.models.Conversation as Model<ConversationDoc>) ||
  mongoose.model<ConversationDoc>("Conversation", ConversationSchema);

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConversation extends Document {
  sessionId: string;
  userId?: mongoose.Types.ObjectId;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }>;
  context: {
    businessType?: string;
    businessAge?: string;
    onlinePresence?: string;
    requirements?: string[];
    customerName?: string;
    budget?: number;
    stage: 'greeting' | 'understanding' | 'requirements' | 'pricing' | 'account_creation' | 'payment' | 'completed';
  };
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant', 'system'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    context: {
      businessType: String,
      businessAge: String,
      onlinePresence: String,
      requirements: [String],
      customerName: String,
      budget: Number,
      stage: {
        type: String,
        enum: ['greeting', 'understanding', 'requirements', 'pricing', 'account_creation', 'payment', 'completed'],
        default: 'greeting',
      },
    },
  },
  {
    timestamps: true,
  }
);

const Conversation: Model<IConversation> =
  mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;
