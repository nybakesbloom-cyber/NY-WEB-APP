import { Product } from "@/server/models/Product";
import { withAdmin, body, query, json, fail, paging, findPaged } from "@/server/api";

export const GET = withAdmin(async ({ req }) => {
  const q = query(req);
  const filter: Record<string, unknown> = {};

  const category = q.get("category");
  if (category) filter.category = category;

  const active = q.get("active");
  if (active === "true" || active === "false") filter.active = active === "true";

  const search = q.get("q")?.trim();
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
      { tagline: { $regex: search, $options: "i" } },
    ];
  }

  return json(
    await findPaged(
      () => Product.countDocuments(filter),
      (skip, limit) => Product.find(filter).sort({ sort: 1, name: 1 }).skip(skip).limit(limit).lean(),
      paging(req, 24),
    ),
  );
});

export const POST = withAdmin(async ({ req }) => {
  const input = await body<Record<string, unknown>>(req);
  if (!input.slug || !input.name || input.price === undefined) {
    return fail("slug, name and price are required");
  }
  const created = await Product.create(input);
  return json({ item: created }, 201);
});
