import { Order, type OrderStatus } from "@/server/models/Order";
import { nextStatuses, type Channel } from "@/lib/orders";
import { recomputePayment } from "@/server/payments";
import { Transaction } from "@/server/models/Transaction";
import { withAdmin, body, json, fail } from "@/server/api";

type P = { id: string };

export const GET = withAdmin<P>(async ({ params }) => {
  const item = await Order.findById(params.id).lean();
  if (!item) return fail("Not found", 404);
  // Keep the stored standing honest even if a transaction was written directly.
  await recomputePayment(item.number);
  const transactions = await Transaction.find({ orderNumber: item.number })
    .sort({ createdAt: -1 })
    .lean();
  return json({ item, transactions });
});

export const PATCH = withAdmin<P>(async ({ req, params, session }) => {
  const input = await body<{ status?: OrderStatus; note?: string; notes?: string }>(req);

  const order = await Order.findById(params.id);
  if (!order) return fail("Not found", 404);

  if (input.status && input.status !== order.status) {
    const allowed = nextStatuses(order.status as OrderStatus, order.channel as Channel);
    if (!allowed.includes(input.status)) {
      return fail(
        `Cannot move an order from ${order.status} to ${input.status}` +
          (allowed.length ? `. Allowed: ${allowed.join(", ")}` : ". It is already final."),
        422,
      );
    }
    order.status = input.status;
    order.statusHistory.push({
      status: input.status,
      at: new Date(),
      note: input.note ?? `by ${session.email}`,
    });
  }

  if (typeof input.notes === "string") order.notes = input.notes;

  await order.save();
  return json({ item: order.toObject() });
});
