import { revalidatePath } from "next/cache";
import { Content } from "@/server/models/Content";
import { withAdmin, body, json, fail } from "@/server/api";

type P = { key: string };

export const GET = withAdmin<P>(async ({ params }) => {
  const item = await Content.findOne({ key: params.key }).lean();
  return item ? json({ item }) : fail("Not found", 404);
});

export const PUT = withAdmin<P>(async ({ req, params, session }) => {
  const input = await body<{ data?: unknown; label?: string }>(req);
  if (input.data === undefined) return fail("data is required");

  const item = await Content.findOneAndUpdate(
    { key: params.key },
    {
      key: params.key,
      data: input.data,
      ...(input.label ? { label: input.label } : {}),
      updatedBy: session.email,
    },
    { upsert: true, new: true },
  ).lean();

  // The storefront caches content, so an edit has to push the pages it feeds.
  for (const path of ["/", "/shop", "/how-it-works"]) revalidatePath(path, "page");
  revalidatePath("/", "layout");

  return json({ item });
});
