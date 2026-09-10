import { connectDB } from "@/server/db";
import { Media } from "@/server/models/Media";

/** Public image serving. Ids are immutable, so these cache hard. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  if (!/^[a-f0-9]{24}$/i.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  await connectDB();
  const item = await Media.findById(id).lean();
  if (!item) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(item.data.buffer as ArrayBuffer), {
    headers: {
      "Content-Type": item.contentType,
      "Content-Length": String(item.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
