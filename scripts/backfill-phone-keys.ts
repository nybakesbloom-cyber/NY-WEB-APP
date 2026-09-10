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
import { phoneKey } from "../src/lib/orders.ts";

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
