/**
 * Backfills phoneKey on orders written before the field existed, and seeds the
 * order-number counter past the highest number already used so a new atomic
 * number can never collide with a historic one.
 *
 *   npm run backfill
 */
import { readFileSync } from "node:fs";
import mongoose from "mongoose";
import { Order } from "../src/server/models/Order.ts";
import { phoneKey, paymentStatusFrom } from "../src/lib/orders.ts";
import { Transaction } from "../src/server/models/Transaction.ts";

try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  /* rely on the environment */
}

await mongoose.connect(process.env.MONGODB_URI!);
console.log(`connected to ${mongoose.connection.name}`);

const orders = await Order.find({ $or: [{ phoneKey: { $exists: false } }, { phoneKey: "" }] })
  .select("number sender.phone")
  .lean();

let filled = 0;
for (const o of orders) {
  const key = phoneKey(o.sender?.phone);
  if (!key) continue;
  await Order.updateOne({ _id: o._id }, { phoneKey: key });
  filled++;
}
console.log(`phoneKey: ${filled} filled, ${orders.length - filled} had no usable number`);

// Fields added after some orders were written; without these the admin reads
// undefined and the list crashes on render.
const noChannel = await Order.updateMany(
  { channel: { $exists: false } },
  { $set: { channel: "online" } },
);
const noPayment = await Order.updateMany(
  { paymentStatus: { $exists: false } },
  { $set: { paymentStatus: "unpaid", amountPaid: 0 } },
);
console.log(`channel: ${noChannel.modifiedCount} filled`);
console.log(`paymentStatus: ${noPayment.modifiedCount} filled`);

// Recompute what has actually been collected on each. Inlined rather than
// importing src/server/payments.ts, which uses the @/ alias and extensionless
// imports that plain Node cannot resolve.
const all = await Order.find().select("number total").lean();
let recomputed = 0;
for (const o of all) {
  const [sums] = await Transaction.aggregate([
    { $match: { orderNumber: o.number } },
    {
      $group: {
        _id: null,
        charged: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ["$kind", "charge"] }, { $eq: ["$status", "paid"] }] },
              "$amount",
              0,
            ],
          },
        },
        refunded: { $sum: { $cond: [{ $eq: ["$kind", "refund"] }, "$amount", 0] } },
      },
    },
  ]);
  const charged = sums?.charged ?? 0;
  const refunded = sums?.refunded ?? 0;
  await Order.updateOne(
    { number: o.number },
    {
      paymentStatus: paymentStatusFrom(o.total, charged, refunded),
      amountPaid: Math.max(0, charged - refunded),
    },
  );
  recomputed++;
}
console.log(`payment standing recomputed for ${recomputed} orders`);

// Move the counter past every number already issued.
const highest = await Order.find().select("number").sort({ number: -1 }).limit(1).lean();
const used = Number(String(highest[0]?.number ?? "").replace(/\D/g, "")) || 100000;
const counters = mongoose.connection.collection("counters");
const current = await counters.findOne({ _id: "orderNumber" as never });
const value = (current as { value?: number } | null)?.value ?? 0;
const target = Math.max(value, used - 100000 + 1);
await counters.updateOne({ _id: "orderNumber" as never }, { $set: { value: target } }, { upsert: true });
console.log(`order counter set to ${target} (highest existing number was ${used})`);

await mongoose.disconnect();
console.log("done");
