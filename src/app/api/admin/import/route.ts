import { Product } from "@/server/models/Product";
import { Content } from "@/server/models/Content";
import { withAdmin, body, json, fail } from "@/server/api";
import { rowToProduct, type ImportIssue } from "@/lib/csv";
import { PRODUCTS, CONTENT } from "@/lib/seed-data";
import { revalidatePath } from "next/cache";

type Payload = {
  kind: "starter" | "products";
  rows?: Record<string, unknown>[];
  /** Overwrite rows that already exist, rather than leaving them alone. */
  replace?: boolean;
  /** Validate and report without writing anything. */
  dryRun?: boolean;
};

function pushPages() {
  for (const path of ["/", "/shop", "/how-it-works"]) revalidatePath(path, "page");
  revalidatePath("/", "layout");
}

export const POST = withAdmin(async ({ req, session }) => {
  const input = await body<Payload>(req);

  /* ---------------------------------------------------- starter catalogue */
  if (input.kind === "starter") {
    let productsWritten = 0;
    let productsSkipped = 0;

    for (const [i, p] of PRODUCTS.entries()) {
      const exists = await Product.exists({ slug: p.slug });
      if (exists && !input.replace) {
        productsSkipped++;
        continue;
      }
      if (input.dryRun) {
        productsWritten++;
        continue;
      }
      await Product.findOneAndUpdate(
        { slug: p.slug },
        {
          slug: p.slug, name: p.name, tagline: p.tagline, category: p.category,
          occasions: p.occasions, price: p.price, mrp: p.mrp,
          rating: p.rating, reviews: p.reviews,
          art: { kind: p.art, hues: p.hues },
          variants: p.variants, flavours: p.flavours ?? [], contains: p.contains,
          description: p.description, care: p.care,
          bestseller: !!p.bestseller, eggless: !!p.eggless, sameDay: !!p.sameDay,
          active: true, sort: i,
        },
        { upsert: true },
      );
      productsWritten++;
    }

    let contentWritten = 0;
    let contentSkipped = 0;
    for (const block of CONTENT) {
      const exists = await Content.exists({ key: block.key });
      if (exists && !input.replace) {
        contentSkipped++;
        continue;
      }
      if (input.dryRun) {
        contentWritten++;
        continue;
      }
      await Content.findOneAndUpdate(
        { key: block.key },
        { key: block.key, label: block.label, data: block.data, updatedBy: session.email },
        { upsert: true },
      );
      contentWritten++;
    }

    if (!input.dryRun) pushPages();

    return json({
      dryRun: !!input.dryRun,
      products: { written: productsWritten, skipped: productsSkipped },
      content: { written: contentWritten, skipped: contentSkipped },
    });
  }

  /* --------------------------------------------------------- product rows */
  if (input.kind !== "products") return fail("kind must be 'starter' or 'products'");

  const rows = input.rows ?? [];
  if (!Array.isArray(rows) || rows.length === 0) return fail("No rows to import");
  if (rows.length > 2000) return fail("That is more than 2000 rows — split the file");

  const issues: ImportIssue[] = [];
  const docs: Record<string, unknown>[] = [];
  const seen = new Set<string>();

  rows.forEach((raw, i) => {
    const { doc, issue } = rowToProduct(raw, i);
    if (issue) return void issues.push(issue);
    const slug = String(doc!.slug);
    if (seen.has(slug)) {
      issues.push({ row: i + 2, slug, error: "duplicate slug in this file" });
      return;
    }
    seen.add(slug);
    docs.push(doc!);
  });

  // Nothing is written unless every row is usable — a half-imported catalogue
  // is worse than a rejected file.
  if (issues.length) {
    return json(
      { dryRun: !!input.dryRun, ok: false, valid: docs.length, issues: issues.slice(0, 50) },
      422,
    );
  }

  const existing = new Set(
    (await Product.find({ slug: { $in: docs.map((d) => String(d.slug)) } }).select("slug").lean()).map(
      (p) => p.slug,
    ),
  );
  const created = docs.filter((d) => !existing.has(String(d.slug))).length;
  const updated = docs.length - created;

  if (input.dryRun) {
    return json({
      dryRun: true, ok: true, issues: [],
      willCreate: created, willUpdate: updated,
      preview: docs.slice(0, 10).map((d) => ({ slug: d.slug, name: d.name, price: d.price })),
    });
  }

  if (updated > 0 && !input.replace) {
    return json(
      {
        ok: false,
        needsConfirmation: true,
        willCreate: created,
        willUpdate: updated,
        message: `${updated} of these already exist. Re-send with replace: true to overwrite them.`,
      },
      409,
    );
  }

  await Product.bulkWrite(
    docs.map((d) => ({
      updateOne: {
        filter: { slug: String(d.slug) },
        update: { $set: d },
        upsert: true,
      },
    })),
  );
  pushPages();

  return json({ ok: true, created, updated, total: docs.length });
});
