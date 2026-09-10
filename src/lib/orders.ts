/**
 * Order vocabulary shared by the server and the browser. It lives here rather
 * than in the Mongoose model because the admin UI needs it, and importing the
 * model from a client component drags mongoose — and Node builtins like
 * async_hooks and dns — into the browser bundle.
 */

export const ORDER_STATUSES = [
  "placed",
  "in_kitchen",
  "packed",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** What an operator is allowed to do next, from each state. */
export const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  placed: ["in_kitchen", "cancelled"],
  in_kitchen: ["packed", "cancelled"],
  packed: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Placed",
  in_kitchen: "In the kitchen",
  packed: "Packed & sealed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const TXN_KINDS = ["charge", "refund"] as const;
export const TXN_STATUSES = ["pending", "paid", "failed", "refunded"] as const;
