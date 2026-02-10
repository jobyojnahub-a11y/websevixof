import mongoose, { Schema, type Model } from "mongoose";

export interface PushSubscriptionDoc extends mongoose.Document {
  userId?: mongoose.Types.ObjectId;
  visitorSessionId?: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: Date;
}

const PushSubscriptionSchema = new Schema<PushSubscriptionDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    visitorSessionId: { type: String, index: true },
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export const PushSubscription: Model<PushSubscriptionDoc> =
  (mongoose.models.PushSubscription as Model<PushSubscriptionDoc>) ||
  mongoose.model<PushSubscriptionDoc>("PushSubscription", PushSubscriptionSchema);

