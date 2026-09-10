import { destroySession } from "@/server/session";
import { json } from "@/server/api";

export async function POST() {
  await destroySession();
  return json({ ok: true });
}
