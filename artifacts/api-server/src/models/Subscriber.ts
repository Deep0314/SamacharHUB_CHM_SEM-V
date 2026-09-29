import { Schema, model } from "mongoose";
import crypto from "crypto";

export interface ISubscriber {
  _id: string;
  email: string;
  name: string;
  subscribedAt: Date;
  unsubscribeToken: string;
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: "" },
    unsubscribeToken: { type: String, default: () => crypto.randomBytes(24).toString("hex") },
    subscribedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Subscriber = model<ISubscriber>("Subscriber", SubscriberSchema);
