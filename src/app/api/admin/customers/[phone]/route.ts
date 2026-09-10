import { Order } from "@/server/models/Order";
import { withAdmin, json, fail } from "@/server/api";

type P = { phone: string };

/** Everything one mobile number has ever ordered. */
export const GET = withAdmin<P>(async ({ params }) => {
  const digits = decodeURIComponent(params.phone).replace(/\D/g, "").slice(-10);
  if (digits.length < 6) return fail("That is not a usable mobile number", 400);

  const orders = await Order.find({ phoneKey: digits })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  if (orders.length === 0) return fail("No orders from that number", 404);

  const spent = orders.reduce((n, o) => n + o.total, 0);
  const collected = orders.reduce((n, o) => n + (o.amountPaid ?? 0), 0);

  const favourite = new Map<string, number>();
  for (const o of orders) {
    for (const l of o.lines) favourite.set(l.name, (favourite.get(l.name) ?? 0) + l.qty);
  }

  return json({
    phone: digits,
    name: orders[0].sender?.name ?? "",
    email: orders[0].sender?.email ?? "",
    orders,
    stats: {
      count: orders.length,
      spent,
      collected,
      outstanding: spent - collected,
      average: Math.round(spent / orders.length),
      first: orders[orders.length - 1].createdAt,
      last: orders[0].createdAt,
    },
    favourites: [...favourite.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty })),
  });
});
