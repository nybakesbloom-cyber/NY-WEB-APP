/**
 * Fills the database with a believable trading history so the whole site and
 * admin can be judged as they would look in use — a spread of orders across
 * statuses and channels, customers who come back, refunds, unpaid cash sales.
 *
 *   npm run demo              add on top of whatever is there
 *   npm run demo -- --reset   clear orders and transactions first
 *   npm run demo -- --days 180 --orders 200
 */
import { readFileSync } from "node:fs";
import mongoose from "mongoose";
import { Product } from "../src/server/models/Product.ts";
import { Order } from "../src/server/models/Order.ts";
import { Transaction } from "../src/server/models/Transaction.ts";
import { phoneKey, paymentStatusFrom, type OrderStatus } from "../src/lib/orders.ts";

try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  /* rely on the environment */
}

const arg = (name: string, fallback: number) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : Number(process.argv[i + 1]) || fallback;
};
const reset = process.argv.includes("--reset");
const DAYS = arg("days", 120);
const COUNT = arg("orders", 140);

/* --------------------------------------------------------------- people */

const FIRST = ["Ananya", "Vikram", "Meera", "Rahul", "Priya", "Arjun", "Divya", "Karthik",
  "Sneha", "Rohit", "Aishwarya", "Nikhil", "Shreya", "Aditya", "Kavya", "Manish",
  "Pooja", "Sanjay", "Neha", "Vivek", "Lakshmi", "Imran", "Fatima", "Joseph",
  "Ritu", "Gaurav", "Anjali", "Suresh", "Tanvi", "Harsh"];
const LAST = ["Rao", "Shah", "Joshi", "Nair", "Menon", "Iyer", "Reddy", "Kulkarni",
  "Banerjee", "Chatterjee", "Desai", "Kapoor", "Malhotra", "Pillai", "Sharma",
  "Verma", "Gupta", "Bose", "Naidu", "Fernandes"];

const CITIES: [string, string, string][] = [
  ["Bengaluru", "560038", "Indiranagar 2nd Stage"],
  ["Bengaluru", "560095", "Koramangala 5th Block"],
  ["Mumbai", "400050", "Bandra West"],
  ["Mumbai", "400076", "Powai"],
  ["Delhi NCR", "110016", "Hauz Khas"],
  ["Delhi NCR", "122002", "DLF Phase 2, Gurugram"],
  ["Hyderabad", "500081", "Gachibowli"],
  ["Chennai", "600020", "Adyar"],
  ["Pune", "411001", "Camp"],
  ["Kolkata", "700019", "Ballygunge"],
  ["Kochi", "682016", "Panampilly Nagar"],
  ["Jaipur", "302015", "Malviya Nagar"],
];

const BUILDINGS = ["Prestige Meridian", "Brigade Gateway", "Sobha Dewflower", "Purva Riviera",
  "Lodha Bellissimo", "Godrej Woodsman", "Salarpuria Greenage", "Rohan Vasantha"];

const MESSAGES = ["Happy Birthday, Ammu", "Congratulations!", "Happy Anniversary",
  "Thinking of you", "Many happy returns", "Well done!", "With love", "",
  "Happy Birthday Appa", "Get well soon", "", ""];

const pick = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)];
const between = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

/** Weighted so most orders are one-offs but a real repeat tail exists. */
function makeCustomers(n: number) {
  return Array.from({ length: n }, () => {
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    const [city, pin, area] = pick(CITIES);
    const r = Math.random();
    const orders = r > 0.9 ? between(5, 9) : r > 0.65 ? between(2, 4) : 1;
    return {
      name,
      phone: `9${between(1, 9)}${String(between(0, 99999999)).padStart(8, "0")}`,
      email: `${name.split(" ")[0].toLowerCase()}${between(1, 99)}@example.com`,
      city, pin, area,
      building: `${pick(["A", "B", "C"])}-${between(101, 1204)}, ${pick(BUILDINGS)}`,
      orders,
    };
  });
}

/** Old orders are finished; recent ones are still moving. */
function statusFor(daysAgo: number, channel: "online" | "in_shop"): OrderStatus {
  if (daysAgo > 3) return Math.random() < 0.06 ? "cancelled" : channel === "in_shop" ? "collected" : "delivered";
  if (channel === "in_shop") return pick<OrderStatus>(["placed", "in_kitchen", "ready", "collected"]);
  return pick<OrderStatus>(["placed", "in_kitchen", "packed", "out_for_delivery", "delivered"]);
}

const SLOTS = ["standard", "standard", "standard", "fixed", "midnight", "early"];
const SLOT_FEE: Record<string, number> = { standard: 0, fixed: 120, midnight: 250, early: 200 };
const ONLINE_METHODS = ["upi", "upi", "upi", "card", "netbanking", "cod"];
const SHOP_METHODS = ["cash", "cash", "upi", "card"];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log(`connected to ${mongoose.connection.name}`);

  const products = await Product.find({ active: true }).lean();
  if (products.length === 0) {
    console.error("No products. Run `npm run seed` first.");
    process.exit(1);
  }

  if (reset) {
    const o = await Order.deleteMany({});
    const t = await Transaction.deleteMany({});
    await mongoose.connection.collection("counters").deleteOne({ _id: "orderNumber" as never });
    console.log(`reset: removed ${o.deletedCount} orders and ${t.deletedCount} transactions`);
  }

  const customers = makeCustomers(Math.ceil(COUNT / 1.9));
  const queue = customers.flatMap((c) => Array.from({ length: c.orders }, () => c)).slice(0, COUNT);
  // Shuffle so a customer's orders are spread across the period, not clustered.
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }

  let seq = 1;
  const existing = await Order.find().select("number").sort({ number: -1 }).limit(1).lean();
  if (existing[0]) seq = Number(String(existing[0].number).replace(/\D/g, "")) - 100000 + 1;

  let made = 0;
  let refunds = 0;
  for (const c of queue) {
    const daysAgo = between(0, DAYS);
    const when = new Date(Date.now() - daysAgo * 86400000 - between(0, 82800) * 1000);
    const channel: "online" | "in_shop" = Math.random() < 0.22 ? "in_shop" : "online";

    const lineCount = Math.random() < 0.72 ? 1 : between(2, 3);
    const lines = Array.from({ length: lineCount }, () => {
      const p = pick(products);
      const variant = pick(p.variants);
      return {
        slug: p.slug,
        name: p.name,
        variant: variant?.label ?? "",
        flavour: p.flavours?.length ? pick(p.flavours) : "",
        message: pick(MESSAGES),
        qty: Math.random() < 0.85 ? 1 : 2,
        unitPrice: p.price + (variant?.delta ?? 0),
      };
    });

    const subtotal = lines.reduce((n, l) => n + l.unitPrice * l.qty, 0);
    const slot = channel === "in_shop" ? "collection" : pick(SLOTS);
    const slotFee = channel === "in_shop" ? 0 : (SLOT_FEE[slot] ?? 0);
    const deliveryFee = channel === "in_shop" ? 0 : subtotal >= 1499 ? 0 : 99;
    const payment = channel === "in_shop" ? pick(SHOP_METHODS) : pick(ONLINE_METHODS);
    const codFee = payment === "cod" ? 40 : 0;
    const total = subtotal + deliveryFee + slotFee + codFee;

    const status = statusFor(daysAgo, channel);
    const number = `NY${100000 + seq++}`;

    // Cash on delivery is only collected once it actually arrives.
    const settled = status === "delivered" || status === "collected";
    // Most cancellations happen after the customer has already paid — which is
    // what produces a refund rather than an order that was simply never paid.
    const paidBeforeCancelling = status === "cancelled" && payment !== "cod" && Math.random() < 0.7;
    const paidNow =
      payment === "cod" ? settled : status !== "cancelled" || paidBeforeCancelling;

    const history = [{ status: "placed" as OrderStatus, at: when, note: channel === "in_shop" ? "counter sale" : "placed online" }];
    if (status !== "placed") {
      history.push({ status, at: new Date(when.getTime() + between(1, 20) * 3600000), note: "demo data" });
    }

    const order = await Order.create({
      number,
      lines,
      subtotal, deliveryFee, slotFee, codFee, total,
      channel,
      sender: { name: c.name, phone: c.phone, email: c.email },
      recipient: { name: Math.random() < 0.5 ? c.name : `${pick(FIRST)} ${pick(LAST)}`, phone: c.phone },
      address: channel === "in_shop"
        ? {}
        : { line1: c.building, line2: c.area, city: c.city, pin: c.pin, landmark: "" },
      phoneKey: phoneKey(c.phone),
      deliveryDate: new Date(when.getTime() + 86400000).toISOString().slice(0, 10),
      slot,
      payment,
      surprise: Math.random() < 0.2,
      status,
      statusHistory: history,
      createdAt: when,
      updatedAt: when,
    });

    let charged = 0;
    let refunded = 0;

    if (paidNow) {
      await Transaction.create({
        order: order._id, orderNumber: number, kind: "charge", method: payment,
        amount: total, status: "paid", reference: `${channel === "in_shop" ? "SHOP" : "WEB"}-${number}`,
        createdAt: when, updatedAt: when,
      });
      charged = total;
    } else {
      await Transaction.create({
        order: order._id, orderNumber: number, kind: "charge", method: payment,
        amount: total, status: "pending", reference: `${channel === "in_shop" ? "SHOP" : "WEB"}-${number}`,
        createdAt: when, updatedAt: when,
      });
    }

    // A few cancellations are refunded, and the odd delivery is part-refunded.
    if (status === "cancelled" && charged > 0) {
      await Transaction.create({
        order: order._id, orderNumber: number, kind: "refund", method: payment,
        amount: total, status: "refunded", note: "order cancelled",
        createdAt: new Date(when.getTime() + 3600000), updatedAt: when,
      });
      refunded = total;
      refunds++;
    } else if (settled && charged > 0 && Math.random() < 0.04) {
      const part = Math.min(charged, slotFee || 150);
      await Transaction.create({
        order: order._id, orderNumber: number, kind: "refund", method: payment,
        amount: part, status: "refunded", note: "late delivery, slot charge returned",
        createdAt: new Date(when.getTime() + 7200000), updatedAt: when,
      });
      refunded = part;
      refunds++;
    }

    await Order.updateOne(
      { _id: order._id },
      {
        paymentStatus: paymentStatusFrom(total, charged, refunded),
        amountPaid: Math.max(0, charged - refunded),
      },
    );
    made++;
  }

  await mongoose.connection
    .collection("counters")
    .updateOne({ _id: "orderNumber" as never }, { $set: { value: seq } }, { upsert: true });

  const byStatus = await Order.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]);
  const byPayment = await Order.aggregate([{ $group: { _id: "$paymentStatus", n: { $sum: 1 } } }]);
  const repeat = await Order.aggregate([
    { $group: { _id: "$phoneKey", n: { $sum: 1 } } },
    { $match: { n: { $gte: 2 } } },
    { $count: "people" },
  ]);
  const revenue = await Transaction.aggregate([
    { $match: { kind: "charge", status: "paid" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  console.log(`\norders created: ${made} across ${DAYS} days, ${refunds} with refunds`);
  console.log("by status:  ", Object.fromEntries(byStatus.map((r) => [r._id, r.n])));
  console.log("by payment: ", Object.fromEntries(byPayment.map((r) => [r._id, r.n])));
  console.log(`repeat customers: ${repeat[0]?.people ?? 0}`);
  console.log(`collected: ₹${(revenue[0]?.total ?? 0).toLocaleString("en-IN")}`);

  await mongoose.disconnect();
  console.log("\ndone");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
