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
  "ready",
  "out_for_delivery",
  "delivered",
  "collected",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const CHANNELS = ["online", "in_shop"] as const;
export type Channel = (typeof CHANNELS)[number];

export const CHANNEL_LABEL: Record<Channel, string> = {
  online: "Online",
  in_shop: "In shop",
};

/**
 * A delivery goes out on a van; a counter sale is collected at the shop. They
 * are different journeys, so each channel has its own chain rather than one
 * list containing steps that do not apply.
 */
const FLOW: Record<Channel, OrderStatus[]> = {
  online: ["placed", "in_kitchen", "packed", "out_for_delivery", "delivered"],
  in_shop: ["placed", "in_kitchen", "ready", "collected"],
};

/** What an operator may do next, given where the order is and how it was taken. */
export function nextStatuses(status: OrderStatus, channel: Channel = "online"): OrderStatus[] {
  const flow = FLOW[channel] ?? FLOW.online;
  const i = flow.indexOf(status);
  if (i === -1 || i === flow.length - 1) return [];
  return [flow[i + 1], "cancelled"];
}

export function flowFor(channel: Channel = "online") {
  return FLOW[channel] ?? FLOW.online;
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Placed",
  in_kitchen: "In the kitchen",
  packed: "Packed & sealed",
  ready: "Ready to collect",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  collected: "Collected",
  cancelled: "Cancelled",
};

/** Statuses that still need someone to do something. */
export const OPEN_STATUSES: OrderStatus[] = [
  "placed",
  "in_kitchen",
  "packed",
  "ready",
  "out_for_delivery",
];

export const PAYMENT_STATUSES = ["unpaid", "partial", "paid", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  partial: "Part paid",
  paid: "Paid",
  refunded: "Refunded",
};

/** Derived from what has actually been collected against the order. */
export function paymentStatusFrom(total: number, charged: number, refunded: number): PaymentStatus {
  const net = charged - refunded;
  if (refunded > 0 && net <= 0) return "refunded";
  if (net <= 0) return "unpaid";
  if (net >= total) return "paid";
  return "partial";
}

export const TXN_KINDS = ["charge", "refund"] as const;
export const TXN_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

/**
 * The last ten digits, ignoring spaces, dashes, brackets and a country code.
 * Stored on the order so grouping repeat customers is one indexed field rather
 * than string surgery inside an aggregation.
 */
export function phoneKey(phone: string | undefined | null) {
  return (phone ?? "").replace(/\D/g, "").slice(-10);
}
