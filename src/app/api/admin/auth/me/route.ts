import { getSession } from "@/server/session";
import { json } from "@/server/api";

export async function GET() {
  return json({ user: await getSession() });
}
