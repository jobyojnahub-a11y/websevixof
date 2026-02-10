import mongoose, { Schema, type Model } from "mongoose";

export type SenderRole = "admin" | "client" | "visitor";
export type MessageType = "text" | "file" | "system";

export interface MessageDoc extends mongoose.Document {
  conversationId: mongoose.Types.ObjectId;
  conversationKey: string; // conversationId string for fast lookup

  senderId?: mongoose.Types.ObjectId;
  senderRole: SenderRole;
  senderName: string;

  messageType: MessageType;
  message: string;
  fileUrl?: string;
  fileName?: string;

  timestamp: Date;
  read: boolean;
  readAt?: Date;
}

const MessageSchema = new Schema<MessageDoc>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    conversationKey: { type: String, required: true, index: true },

    senderId: { type: Schema.Types.ObjectId, ref: "User" },
    senderRole: { type: String, enum: ["admin", "client", "visitor"], required: true, index: true },
    senderName: { type: String, required: true },

    messageType: { type: String, enum: ["text", "file", "system"], default: "text" },
    message: { type: String, required: true },
    fileUrl: String,
    fileName: String,

    timestamp: { type: Date, default: Date.now, index: true },
    read: { type: Boolean, default: false, index: true },
    readAt: Date,
  },
  { timestamps: false }
);

export const Message: Model<MessageDoc> =
  (mongoose.models.Message as Model<MessageDoc>) || mongoose.model<MessageDoc>("Message", MessageSchema);

