import { Product } from "@/server/models/Product";
import { withAdmin, body, json, fail } from "@/server/api";

type P = { id: string };

export const GET = withAdmin<P>(async ({ params }) => {
  const item = await Product.findById(params.id).lean();
  return item ? json({ item }) : fail("Not found", 404);
});

export const PATCH = withAdmin<P>(async ({ req, params }) => {
  const input = await body<Record<string, unknown>>(req);
  // Never let the client rewrite bookkeeping fields.
  delete input._id;
  delete input.createdAt;
  delete input.updatedAt;

  const item = await Product.findByIdAndUpdate(params.id, input, {
    new: true,
    runValidators: true,
  }).lean();
  return item ? json({ item }) : fail("Not found", 404);
});

export const DELETE = withAdmin<P>(async ({ params }) => {
  // Soft delete: orders reference products by slug and history must not break.
  const item = await Product.findByIdAndUpdate(
    params.id,
    { active: false },
    { new: true },
  ).lean();
  return item ? json({ item, archived: true }) : fail("Not found", 404);
});
