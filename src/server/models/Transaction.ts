import mongoose, { type InferSchemaType, type Model } from "mongoose";

const { Schema, model, models } = mongoose;

export { TXN_KINDS, TXN_STATUSES } from "@/lib/orders";

import { TXN_KINDS as KINDS, TXN_STATUSES as STATUSES } from "@/lib/orders";

const TransactionSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", index: true },
    orderNumber: { type: String, required: true, index: true },

    kind: { type: String, enum: KINDS, default: "charge" },
    method: { type: String, default: "upi" },
    /** Positive for a charge, positive for a refund too — `kind` gives the sign. */
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: STATUSES, default: "pending", index: true },

    reference: { type: String, default: "" },
    note: { type: String, default: "" },
  },
  { timestamps: true },
);

TransactionSchema.index({ createdAt: -1 });

export type TransactionDoc = InferSchemaType<typeof TransactionSchema> & { _id: string };

export const Transaction: Model<TransactionDoc> =
  (models.Transaction as Model<TransactionDoc>) ??
  model<TransactionDoc>("Transaction", TransactionSchema);
