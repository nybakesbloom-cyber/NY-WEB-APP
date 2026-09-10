import { Order } from "@/server/models/Order";
import type { PipelineStage } from "mongoose";
import { withAdmin, query, json, paging } from "@/server/api";

/**
 * Customers are not a collection — they are whoever has ordered. Grouping the
 * orders by mobile number is what makes a repeat customer visible without
 * asking anyone to register.
 */
export const GET = withAdmin(async ({ req }) => {
  const q = query(req);
  const search = q.get("q")?.trim();
  const repeatOnly = q.get("repeat") === "true";
  const page = paging(req, 25);

  // The base is everyone who has ordered. Filters are layered on top of a copy,
  // so the summary keeps describing the whole customer base rather than the
  // slice currently on screen.
  const base: PipelineStage[] = [
    { $match: { phoneKey: { $nin: ["", null] } } },
    {
      $group: {
        _id: "$phoneKey",
        name: { $last: "$sender.name" },
        email: { $last: "$sender.email" },
        orders: { $sum: 1 },
        spent: { $sum: "$total" },
        collected: { $sum: "$amountPaid" },
        lastOrder: { $max: "$createdAt" },
        firstOrder: { $min: "$createdAt" },
        cities: { $addToSet: "$address.city" },
        channels: { $addToSet: "$channel" },
      },
    },
  ];

  const pipeline: PipelineStage[] = [...base];
  if (repeatOnly) pipeline.push({ $match: { orders: { $gte: 2 } } });
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    pipeline.push({ $match: { $or: [{ _id: rx }, { name: rx }, { email: rx }] } });
  }

  const counted = await Order.aggregate([...pipeline, { $count: "n" }]);
  const total = counted[0]?.n ?? 0;
  const pages = Math.max(1, Math.ceil(total / page.limit));
  const current = Math.min(page.page, pages);

  const items = await Order.aggregate([
    ...pipeline,
    { $sort: { orders: -1, lastOrder: -1 } },
    { $skip: (current - 1) * page.limit },
    { $limit: page.limit },
  ]);

  const [summary] = await Order.aggregate([
    ...base,
    { $group: { _id: null, people: { $sum: 1 }, repeat: { $sum: { $cond: [{ $gte: ["$orders", 2] }, 1, 0] } } } },
  ]);

  return json({
    items,
    page: current,
    pages,
    total,
    limit: page.limit,
    from: total === 0 ? 0 : (current - 1) * page.limit + 1,
    to: Math.min(current * page.limit, total),
    summary: { people: summary?.people ?? 0, repeat: summary?.repeat ?? 0 },
  });
});

