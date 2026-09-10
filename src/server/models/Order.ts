import mongoose, { type InferSchemaType, type Model } from "mongoose";

const { Schema, model, models } = mongoose;

// Relative, not the @/ alias: these models are also loaded by
// scripts/seed.ts under plain Node, which cannot resolve @/.
export {
  ORDER_STATUSES,
  NEXT_STATUS,
  STATUS_LABEL,
  type OrderStatus,
} from "../../lib/orders.ts";

import { ORDER_STATUSES as STATUSES } from "../../lib/orders.ts";

const LineSchema = new Schema(
  {
    slug: { type: String, required: true },
    name: { type: String, required: true },
    variant: { type: String, default: "" },
    flavour: { type: String, default: "" },
    message: { type: String, default: "" },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    number: { type: String, required: true, unique: true },

    lines: { type: [LineSchema], required: true },

    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    slotFee: { type: Number, default: 0, min: 0 },
    codFee: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },

    sender: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
    },
    recipient: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
    address: {
      line1: { type: String, default: "" },
      line2: { type: String, default: "" },
      city: { type: String, default: "" },
      pin: { type: String, default: "" },
      landmark: { type: String, default: "" },
    },

    deliveryDate: { type: String, default: "" },
    slot: { type: String, default: "standard" },
    payment: { type: String, default: "upi" },
    surprise: { type: Boolean, default: false },

    status: { type: String, enum: STATUSES, default: "placed", index: true },
    statusHistory: {
      type: [
        {
          status: { type: String, enum: STATUSES },
          at: { type: Date, default: Date.now },
          note: { type: String, default: "" },
          _id: false,
        },
      ],
      default: [],
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

OrderSchema.index({ createdAt: -1 });

export type OrderDoc = InferSchemaType<typeof OrderSchema> & { _id: string };

export const Order: Model<OrderDoc> =
  (models.Order as Model<OrderDoc>) ?? model<OrderDoc>("Order", OrderSchema);
