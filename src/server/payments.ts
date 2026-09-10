import { Order } from "./models/Order";
import { Transaction } from "./models/Transaction";
import { paymentStatusFrom } from "@/lib/orders";

/**
 * Recomputes an order's payment standing from its transactions. Storing the
 * result keeps "show me everything unpaid" a single indexed query rather than
 * an aggregation across two collections on every list view.
 */
export async function recomputePayment(orderNumber: string) {
  const [totals] = await Transaction.aggregate([
    { $match: { orderNumber } },
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

  const order = await Order.findOne({ number: orderNumber }).select("total").lean();
  if (!order) return null;

  const charged = totals?.charged ?? 0;
  const refunded = totals?.refunded ?? 0;
  const paymentStatus = paymentStatusFrom(order.total, charged, refunded);

  await Order.updateOne(
    { number: orderNumber },
    { paymentStatus, amountPaid: Math.max(0, charged - refunded) },
  );

  return { paymentStatus, amountPaid: charged - refunded };
}
