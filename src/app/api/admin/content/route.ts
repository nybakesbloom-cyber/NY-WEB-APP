import { Content } from "@/server/models/Content";
import { withAdmin, json } from "@/server/api";

export const GET = withAdmin(async () => {
  const items = await Content.find().sort({ key: 1 }).lean();
  return json({ items });
});
