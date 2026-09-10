import { Post } from "@/server/models/Post";
import { withAdmin, body, query, json, fail, paging, findPaged } from "@/server/api";
import { revalidatePath } from "next/cache";

/** Rough reading time, so the card can say "4 min read" without being asked. */
export function readingMinutes(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export const GET = withAdmin(async ({ req }) => {
  const q = query(req);
  const filter: Record<string, unknown> = {};

  const published = q.get("published");
  if (published === "true" || published === "false") filter.published = published === "true";

  const search = q.get("q")?.trim();
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
      { excerpt: { $regex: search, $options: "i" } },
    ];
  }

  return json(
    await findPaged(
      () => Post.countDocuments(filter),
      (skip, limit) =>
        Post.find(filter).sort({ publishedAt: -1, updatedAt: -1 }).skip(skip).limit(limit).lean(),
      paging(req, 20),
    ),
  );
});

export const POST = withAdmin(async ({ req }) => {
  const input = await body<Record<string, unknown>>(req);
  if (!input.slug || !input.title) return fail("slug and title are required");

  const created = await Post.create({
    ...input,
    readMinutes: readingMinutes(String(input.body ?? "")),
    publishedAt: input.published ? new Date() : null,
  });

  revalidatePath("/blog", "page");
  return json({ item: created }, 201);
});
