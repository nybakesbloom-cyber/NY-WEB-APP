import { Order } from "@/server/models/Order";
import { Transaction } from "@/server/models/Transaction";
import { Product } from "@/server/models/Product";
import { withAdmin, json } from "@/server/api";

export const GET = withAdmin(async () => {
  const since = new Date(Date.now() - 30 * 86400000);

  const [statusCounts, revenue, productCount, activeCount, recent, topProducts] =
    await Promise.all([
      Order.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
      Transaction.aggregate([
        { $match: { status: "paid", kind: "charge" } },
        { $group: { _id: null, total: { $sum: "$amount" }, n: { $sum: 1 } } },
      ]),
      Product.countDocuments(),
      Product.countDocuments({ active: true }),
      Order.find().sort({ createdAt: -1 }).limit(6).lean(),
      Order.aggregate([
        { $unwind: "$lines" },
        {
          $group: {
            _id: "$lines.name",
            qty: { $sum: "$lines.qty" },
            value: { $sum: { $multiply: ["$lines.qty", "$lines.unitPrice"] } },
          },
        },
        { $sort: { qty: -1 } },
        { $limit: 5 },
      ]),
    ]);

  const openStatuses = ["placed", "in_kitchen", "packed", "out_for_delivery"];
  const counts = Object.fromEntries(statusCounts.map((c) => [c._id, c.n]));

  return json({
    orders: {
      counts,
      open: openStatuses.reduce((n, s) => n + (counts[s] ?? 0), 0),
      total: Object.values(counts).reduce((n: number, v) => n + (v as number), 0),
      last30: await Order.countDocuments({ createdAt: { $gte: since } }),
    },
    revenue: { collected: revenue[0]?.total ?? 0, payments: revenue[0]?.n ?? 0 },
    products: { total: productCount, active: activeCount },
    recent,
    topProducts,
  });
});
