import mongoose from "mongoose";

/**
 * Order numbers come from an atomic counter rather than a document count plus a
 * random tail. Two tills taking a sale in the same second must not be able to
 * produce the same number — the unique index would reject one of them, losing a
 * real sale.
 */
export async function nextOrderNumber(prefix = "NY") {
  const counters = mongoose.connection.collection("counters");
  const result = await counters.findOneAndUpdate(
    { _id: "orderNumber" as unknown as import("mongodb").ObjectId },
    { $inc: { value: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  const value = (result as { value?: number } | null)?.value ?? 1;
  return `${prefix}${100000 + value}`;
}
