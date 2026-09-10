/**
 * One-time seed: moves the static catalogue and site copy into MongoDB and
 * creates the first admin. Safe to re-run — products and content are upserted
 * by key, so hand edits made in the admin are only overwritten with --force.
 *
 *   npm run seed
 *   npm run seed -- --force        overwrite existing products/content
 *   npm run seed -- --demo-orders  add a few orders to work with
 */
import { readFileSync } from "node:fs";
import mongoose from "mongoose";
import { PRODUCTS, CONTENT } from "../src/lib/seed-data.ts";
import { Product } from "../src/server/models/Product.ts";
import { Content } from "../src/server/models/Content.ts";
import { AdminUser } from "../src/server/models/AdminUser.ts";
import { Order } from "../src/server/models/Order.ts";
import { Transaction } from "../src/server/models/Transaction.ts";
import bcrypt from "bcryptjs";

// .env.local is read by Next at runtime, but a plain node script needs it too.
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const force = process.argv.includes("--force");
const withOrders = process.argv.includes("--demo-orders");

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log("connected to", mongoose.connection.name);

  // ---- products ----------------------------------------------------------
  let created = 0;
  let skipped = 0;
  for (const [i, p] of PRODUCTS.entries()) {
    const existing = await Product.findOne({ slug: p.slug });
    if (existing && !force) {
      skipped++;
      continue;
    }
    const doc = {
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      category: p.category,
      occasions: p.occasions,
      price: p.price,
      mrp: p.mrp,
      rating: p.rating,
      reviews: p.reviews,
      art: { kind: p.art, hues: p.hues },
      variants: p.variants,
      flavours: p.flavours ?? [],
      contains: p.contains,
      description: p.description,
      care: p.care,
      bestseller: !!p.bestseller,
      eggless: !!p.eggless,
      sameDay: !!p.sameDay,
      active: true,
      sort: i,
    };
    await Product.findOneAndUpdate({ slug: p.slug }, doc, { upsert: true, new: true });
    created++;
  }
  console.log(`products: ${created} written, ${skipped} left alone`);

  // ---- content -----------------------------------------------------------
  let cWritten = 0;
  let cSkipped = 0;
  for (const block of CONTENT) {
    const existing = await Content.findOne({ key: block.key });
    if (existing && !force) {
      cSkipped++;
      continue;
    }
    await Content.findOneAndUpdate(
      { key: block.key },
      { key: block.key, label: block.label, data: block.data, updatedBy: "seed" },
      { upsert: true },
    );
    cWritten++;
  }
  console.log(`content: ${cWritten} written, ${cSkipped} left alone`);

  // ---- first admin -------------------------------------------------------
  const email = (process.env.ADMIN_SEED_EMAIL ?? "").toLowerCase().trim();
  const password = process.env.ADMIN_SEED_PASSWORD ?? "";
  if (!email || !password) {
    console.log("admin: skipped (set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD)");
  } else if (await AdminUser.findOne({ email })) {
    console.log(`admin: ${email} already exists`);
  } else {
    await AdminUser.create({
      email,
      name: "Store owner",
      passwordHash: await bcrypt.hash(password, 12),
      role: "owner",
    });
    console.log(`admin: created ${email}`);
  }

  // ---- a few orders to work with ----------------------------------------
  if (withOrders && (await Order.countDocuments()) === 0) {
    const picks = await Product.find({ bestseller: true }).limit(4);
    const statuses = ["placed", "in_kitchen", "out_for_delivery", "delivered"] as const;
    const people = [
      ["Ananya Rao", "Bengaluru", "560038"],
      ["Vikram Shah", "Pune", "411001"],
      ["Meera Joshi", "Delhi NCR", "110016"],
      ["Rahul Nair", "Kochi", "682016"],
    ];
    for (let i = 0; i < 4; i++) {
      const p = picks[i % picks.length];
      const qty = 1 + (i % 2);
      const subtotal = p.price * qty;
      const deliveryFee = subtotal >= 1499 ? 0 : 99;
      const total = subtotal + deliveryFee;
      const number = `NY${100200 + i}`;
      const order = await Order.create({
        number,
        lines: [{ slug: p.slug, name: p.name, variant: p.variants[0].label, flavour: p.flavours?.[0] ?? "", message: i === 0 ? "Happy Birthday, Ammu" : "", qty, unitPrice: p.price }],
        subtotal, deliveryFee, total,
        sender: { name: people[i][0], phone: "98XXXXXX21", email: "customer@example.com" },
        recipient: { name: people[i][0], phone: "99XXXXXX07" },
        address: { line1: "B-702, Prestige Meridian", line2: "Indiranagar 2nd Stage", city: people[i][1], pin: people[i][2] },
        deliveryDate: new Date(Date.now() + i * 86400000).toISOString().slice(0, 10),
        slot: i === 0 ? "midnight" : "standard",
        payment: i === 3 ? "cod" : "upi",
        status: statuses[i],
        statusHistory: [{ status: "placed", at: new Date(), note: "seeded" }],
      });
      await Transaction.create({
        order: order._id, orderNumber: number, kind: "charge",
        method: order.payment, amount: total,
        status: i === 3 ? "pending" : "paid",
        reference: `SEED-${number}`,
      });
    }
    console.log("orders: 4 demo orders + transactions created");
  }

  await mongoose.disconnect();
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
