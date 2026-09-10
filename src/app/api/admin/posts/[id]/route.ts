import { revalidatePath } from "next/cache";
import { Post } from "@/server/models/Post";
import { withAdmin, body, json, fail } from "@/server/api";
import { readingMinutes } from "../route";

type P = { id: string };

export const GET = withAdmin<P>(async ({ params }) => {
  const item = await Post.findById(params.id).lean();
  return item ? json({ item }) : fail("Not found", 404);
});

export const PATCH = withAdmin<P>(async ({ req, params }) => {
  const input = await body<Record<string, unknown>>(req);
  delete input._id;
  delete input.createdAt;
  delete input.updatedAt;

  const existing = await Post.findById(params.id);
  if (!existing) return fail("Not found", 404);

  if (typeof input.body === "string") input.readMinutes = readingMinutes(input.body);
  // Stamp the publish date the first time it goes live, and keep it after.
  if (input.published && !existing.publishedAt) input.publishedAt = new Date();
  if (input.published === false) input.publishedAt = existing.publishedAt;

  const item = await Post.findByIdAndUpdate(params.id, input, {
    new: true,
    runValidators: true,
  }).lean();

  revalidatePath("/blog", "page");
  if (item) revalidatePath(`/blog/${item.slug}`, "page");
  return json({ item });
});

export const DELETE = withAdmin<P>(async ({ params }) => {
  const item = await Post.findByIdAndDelete(params.id).lean();
  if (!item) return fail("Not found", 404);
  revalidatePath("/blog", "page");
  return json({ deleted: true });
});
