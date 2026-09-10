import { Media } from "@/server/models/Media";
import { Product } from "@/server/models/Product";
import { withAdmin, body, json, fail } from "@/server/api";

type P = { id: string };

export const PATCH = withAdmin<P>(async ({ req, params }) => {
  const input = await body<{ alt?: string }>(req);
  const item = await Media.findByIdAndUpdate(
    params.id,
    { alt: input.alt ?? "" },
    { new: true },
  )
    .select("-data")
    .lean();
  return item ? json({ item }) : fail("Not found", 404);
});

export const DELETE = withAdmin<P>(async ({ params }) => {
  // Products pointing at this image would render a broken frame, so clear them
  // first and let the generated art take over again.
  const used = await Product.countDocuments({ image: params.id });
  await Product.updateMany({ image: params.id }, { image: null });

  const item = await Media.findByIdAndDelete(params.id).select("-data").lean();
  return item ? json({ deleted: true, detachedFrom: used }) : fail("Not found", 404);
});
