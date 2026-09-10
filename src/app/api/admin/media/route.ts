import { Media } from "@/server/models/Media";
import { withAdmin, query, json, fail, paging, findPaged } from "@/server/api";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml", "image/gif"];

export const GET = withAdmin(async ({ req }) => {
  const search = query(req).get("q")?.trim();
  const filter = search ? { filename: { $regex: search, $options: "i" } } : {};
  // Never ship the binary in a listing.
  return json(
    await findPaged(
      () => Media.countDocuments(filter),
      (skip, limit) =>
        Media.find(filter).select("-data").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      paging(req, 24),
    ),
  );
});

export const POST = withAdmin(async ({ req, session }) => {
  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) return fail("Attach a file under the field name 'file'");
  if (!ALLOWED.includes(file.type)) {
    return fail(`${file.type || "That file type"} is not allowed. Use ${ALLOWED.join(", ")}`, 415);
  }
  if (file.size > MAX_BYTES) {
    return fail(`Images must be under ${MAX_BYTES / 1024 / 1024} MB (this one is ${(file.size / 1024 / 1024).toFixed(1)} MB)`, 413);
  }

  const created = await Media.create({
    filename: file.name || "upload",
    contentType: file.type,
    size: file.size,
    alt: String(form.get("alt") ?? ""),
    data: Buffer.from(await file.arrayBuffer()),
    uploadedBy: session.email,
  });

  return json(
    {
      item: {
        _id: created._id,
        filename: created.filename,
        contentType: created.contentType,
        size: created.size,
        alt: created.alt,
        url: `/api/media/${created._id}`,
      },
    },
    201,
  );
});
