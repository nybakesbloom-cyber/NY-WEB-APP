import { Order } from "@/server/models/Order";
import { withAdmin, query, json } from "@/server/api";

export const GET = withAdmin(async ({ req }) => {
  const q = query(req);
  const filter: Record<string, unknown> = {};

  const status = q.get("status");
  if (status && status !== "all") filter.status = status;

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

  const limit = Math.min(Number(q.get("limit") ?? 100), 200);
  const items = await Order.find(filter).sort({ createdAt: -1 }).limit(limit).lean();

  const counts = await Order.aggregate([
    { $group: { _id: "$status", n: { $sum: 1 } } },
  ]);

  return json({
    items,
    total: items.length,
    counts: Object.fromEntries(counts.map((c) => [c._id, c.n])),
  });
});
