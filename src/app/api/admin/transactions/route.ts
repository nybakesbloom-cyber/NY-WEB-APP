import { Transaction } from "@/server/models/Transaction";
import { TXN_STATUSES } from "@/lib/orders";
import { Order } from "@/server/models/Order";
import { withAdmin, body, query, json, fail } from "@/server/api";

export const GET = withAdmin(async ({ req }) => {
  const q = query(req);
  const filter: Record<string, unknown> = {};

  const status = q.get("status");
  if (status && status !== "all") filter.status = status;
  const kind = q.get("kind");
  if (kind && kind !== "all") filter.kind = kind;

  const search = q.get("q")?.trim();
  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: "i" } },
      { reference: { $regex: search, $options: "i" } },
    ];
  }

  const items = await Transaction.find(filter).sort({ createdAt: -1 }).limit(200).lean();

  // Money in, money out, and what is still owed.
  const [totals] = await Transaction.aggregate([
    {
      $group: {
        _id: null,
        collected: {
          $sum: { $cond: [{ $and: [{ $eq: ["$kind", "charge"] }, { $eq: ["$status", "paid"] }] }, "$amount", 0] },
        },
        refunded: {
          $sum: { $cond: [{ $eq: ["$kind", "refund"] }, "$amount", 0] },
        },
        pending: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0] },
        },
      },
    },
  ]);

  return json({
    items,
    totals: {
      collected: totals?.collected ?? 0,
      refunded: totals?.refunded ?? 0,
      pending: totals?.pending ?? 0,
      net: (totals?.collected ?? 0) - (totals?.refunded ?? 0),
    },
  });
});

/** Record a payment or a refund against an order. */
export const POST = withAdmin(async ({ req, session }) => {
  const input = await body<{
    orderNumber?: string;
    kind?: "charge" | "refund";
    amount?: number;
    method?: string;
    status?: (typeof TXN_STATUSES)[number];
    reference?: string;
    note?: string;
  }>(req);

  if (!input.orderNumber) return fail("orderNumber is required");
  const order = await Order.findOne({ number: input.orderNumber });
  if (!order) return fail(`No order numbered ${input.orderNumber}`, 404);

  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) return fail("amount must be a positive number");

  if (input.status && !TXN_STATUSES.includes(input.status)) {
    return fail(`status must be one of ${TXN_STATUSES.join(", ")}`);
  }

  if (input.kind === "refund") {
    const paid = await Transaction.aggregate([
      { $match: { orderNumber: order.number, kind: "charge", status: "paid" } },
      { $group: { _id: null, n: { $sum: "$amount" } } },
    ]);
    const refunded = await Transaction.aggregate([
      { $match: { orderNumber: order.number, kind: "refund" } },
      { $group: { _id: null, n: { $sum: "$amount" } } },
    ]);
    const remaining = (paid[0]?.n ?? 0) - (refunded[0]?.n ?? 0);
    if (amount > remaining) {
      return fail(`Only ₹${remaining} is left to refund on ${order.number}`, 422);
    }
  }

  const txn = await Transaction.create({
    order: order._id,
    orderNumber: order.number,
    kind: input.kind ?? "charge",
    method: input.method ?? order.payment,
    amount,
    status: input.status ?? (input.kind === "refund" ? "refunded" : "paid"),
    reference: input.reference ?? "",
    note: input.note ? `${input.note} (${session.email})` : `by ${session.email}`,
  });

  return json({ item: txn }, 201);
});
