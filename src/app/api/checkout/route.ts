import { connectDB } from "@/server/db";
import { Product } from "@/server/models/Product";
import { Order } from "@/server/models/Order";
import { Transaction } from "@/server/models/Transaction";
import { Content } from "@/server/models/Content";
import { json, fail } from "@/server/api";
import { recomputePayment } from "@/server/payments";
import { nextOrderNumber } from "@/server/orderNumber";
import { phoneKey } from "@/lib/orders";

type IncomingLine = {
  slug: string;
  variant?: string;
  flavour?: string;
  message?: string;
  qty: number;
};

const SLOT_FEES: Record<string, number> = {
  standard: 0,
  fixed: 120,
  midnight: 250,
  early: 200,
};

export async function POST(req: Request) {
  try {
    await connectDB();

    const input = await req.json();
    const lines: IncomingLine[] = Array.isArray(input.lines) ? input.lines : [];
    if (lines.length === 0) return fail("The cart is empty");

    const settings =
      (await Content.findOne({ key: "settings" }).lean())?.data ?? {};
    const freeOver = Number(settings.freeDeliveryOver ?? 1499);
    const baseFee = Number(settings.deliveryFee ?? 99);
    const codFeeRate = Number(settings.codFee ?? 40);
    const prefix = String(settings.orderPrefix ?? "NY");
    // Default to demo: a site that is still being set up should not be
    // collecting real orders because someone found the URL.
    const demoMode = settings.demoMode !== false;

    // Prices come from the database, never from the browser.
    const slugs = lines.map((l) => l.slug);
    const products = await Product.find({ slug: { $in: slugs }, active: true }).lean();
    const bySlug = new Map(products.map((p) => [p.slug, p]));

    const priced = [];
    for (const line of lines) {
      const product = bySlug.get(line.slug);
      if (!product) return fail(`${line.slug} is no longer available`, 409);

      const qty = Math.max(1, Math.min(20, Number(line.qty) || 1));
      const variant =
        product.variants.find((v) => v.label === line.variant) ?? product.variants[0];

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
    const deliveryFee = subtotal >= freeOver ? 0 : baseFee;
    const slot = String(input.slot ?? "standard");
    const slotFee = SLOT_FEES[slot] ?? 0;
    const payment = String(input.payment ?? "upi");
    const codFee = payment === "cod" ? codFeeRate : 0;

    if (payment === "cod" && slot === "midnight") {
      return fail("Cash on delivery is not available on the midnight slot", 422);
    }

    const total = subtotal + deliveryFee + slotFee + codFee;

    if (demoMode) {
      // Everything above still runs — prices, availability and the
      // cash-on-delivery rule are all checked — but nothing is written.
      return json(
        {
          ok: true,
          demo: true,
          number: `${prefix}-DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
          total,
        },
        200,
      );
    }

    const number = await nextOrderNumber(prefix);

    const order = await Order.create({
      number,
      lines: priced,
      subtotal,
      deliveryFee,
      slotFee,
      codFee,
      total,
      sender: input.sender ?? {},
      phoneKey: phoneKey(input.sender?.phone),
      recipient: input.recipient ?? {},
      address: input.address ?? {},
      deliveryDate: String(input.deliveryDate ?? ""),
      slot,
      payment,
      surprise: !!input.surprise,
      status: "placed",
      statusHistory: [{ status: "placed", at: new Date(), note: "placed online" }],
    });

    await Transaction.create({
      order: order._id,
      orderNumber: number,
      kind: "charge",
      method: payment,
      amount: total,
      // Cash is collected at the door; everything else is treated as captured.
      status: payment === "cod" ? "pending" : "paid",
      reference: `WEB-${number}`,
    });

    await recomputePayment(number);
    return json({ ok: true, number, total }, 201);
  } catch (err) {
    console.error("[checkout]", err);
    return fail("Could not place the order", 500);
  }
}
