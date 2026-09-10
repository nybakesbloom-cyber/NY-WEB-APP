import { Order } from "@/server/models/Order";
import { OPEN_STATUSES } from "@/lib/orders";
import { Product } from "@/server/models/Product";
import { Transaction } from "@/server/models/Transaction";
import { Content } from "@/server/models/Content";
import { recomputePayment } from "@/server/payments";
import { nextOrderNumber } from "@/server/orderNumber";
import { phoneKey } from "@/lib/orders";
import { withAdmin, body, query, json, fail, paging, findPaged } from "@/server/api";

export const GET = withAdmin(async ({ req }) => {
  const q = query(req);
  const filter: Record<string, unknown> = {};

  const status = q.get("status");
  if (status && status !== "all") filter.status = status;
  if (status === "open") filter.status = { $in: OPEN_STATUSES };

  const channel = q.get("channel");
  if (channel && channel !== "all") filter.channel = channel;

  const payment = q.get("payment");
  if (payment && payment !== "all") filter.paymentStatus = payment;

  const search = q.get("q")?.trim();
  if (search) {
    filter.$or = [
      { number: { $regex: search, $options: "i" } },
      { "sender.name": { $regex: search, $options: "i" } },
      { "recipient.name": { $regex: search, $options: "i" } },
      { "sender.phone": { $regex: search, $options: "i" } },
      { "address.city": { $regex: search, $options: "i" } },
    ];
  }

  const [result, counts] = await Promise.all([
    findPaged(
      () => Order.countDocuments(filter),
      (skip, limit) => Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      paging(req),
    ),
    Order.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
  ]);

  return json({ ...result, counts: Object.fromEntries(counts.map((c) => [c._id, c.n])) });
});

/* ------------------------------------------------------------------ *
 * Counter sales
 * ------------------------------------------------------------------ */

/**
 * An order taken at the shop. Same document as a web order with
 * channel: "in_shop", so it flows through the same screens and reporting —
 * it just gets collected rather than delivered.
 */
export const POST = withAdmin(async ({ req, session }) => {
  const input = await body<{
    lines: { slug: string; variant?: string; flavour?: string; message?: string; qty: number }[];
    customer?: { name?: string; phone?: string; email?: string };
    payment?: string;
    paidNow?: boolean;
    discount?: number;
    notes?: string;
  }>(req);

  const lines = Array.isArray(input.lines) ? input.lines : [];
  if (lines.length === 0) return fail("Add at least one item");

  const products = await Product.find({ slug: { $in: lines.map((l) => l.slug) } }).lean();
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const priced = [];
  for (const line of lines) {
    const product = bySlug.get(line.slug);
    if (!product) return fail(`${line.slug} is not in the catalogue`, 409);
    const qty = Math.max(1, Math.min(50, Number(line.qty) || 1));
    const variant = product.variants.find((v) => v.label === line.variant) ?? product.variants[0];
    priced.push({
      slug: product.slug,
      name: product.name,
      variant: variant?.label ?? "",
      flavour: line.flavour ?? "",
      message: (line.message ?? "").slice(0, 40),
      qty,
      unitPrice: product.price + (variant?.delta ?? 0),
    });
  }

  const subtotal = priced.reduce((n, l) => n + l.unitPrice * l.qty, 0);
  const discount = Math.max(0, Math.min(subtotal, Number(input.discount) || 0));
  const total = subtotal - discount;

  const settings = (await Content.findOne({ key: "settings" }).lean())?.data ?? {};
  const prefix = String(settings.orderPrefix ?? "NY");
  const number = await nextOrderNumber(prefix);

  const order = await Order.create({
    number,
    lines: priced,
    subtotal,
    // A counter sale has no delivery; a discount is carried as a negative fee.
    deliveryFee: 0,
    slotFee: 0,
    codFee: discount > 0 ? -discount : 0,
    total,
    channel: "in_shop",
    sender: {
      name: input.customer?.name ?? "Walk-in",
      phone: input.customer?.phone ?? "",
      email: input.customer?.email ?? "",
    },
    recipient: { name: input.customer?.name ?? "Walk-in", phone: input.customer?.phone ?? "" },
    phoneKey: phoneKey(input.customer?.phone),
    deliveryDate: new Date().toISOString().slice(0, 10),
    slot: "collection",
    payment: input.payment ?? "cash",
    status: "placed",
    statusHistory: [{ status: "placed", at: new Date(), note: `counter sale by ${session.email}` }],
    notes: input.notes ?? "",
  });

  await Transaction.create({
    order: order._id,
    orderNumber: number,
    kind: "charge",
    method: input.payment ?? "cash",
    amount: total,
    status: input.paidNow === false ? "pending" : "paid",
    reference: `SHOP-${number}`,
    note: `counter sale by ${session.email}`,
  });

  const payment = await recomputePayment(number);
  return json({ ok: true, item: order.toObject(), payment }, 201);
});
