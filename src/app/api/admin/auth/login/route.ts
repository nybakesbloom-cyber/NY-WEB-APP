import bcrypt from "bcryptjs";
import { connectDB } from "@/server/db";
import { AdminUser } from "@/server/models/AdminUser";
import { createSession } from "@/server/session";
import { checkEnvAdmin } from "@/server/envAdmin";
import { fail, json } from "@/server/api";

export async function POST(req: Request) {
  let payload: { email?: string; password?: string };
  try {
    payload = await req.json();
  } catch {
    return fail("Expected a JSON body");
  }

  const email = (payload.email ?? "").toLowerCase().trim();
  const password = payload.password ?? "";
  if (!email || !password) return fail("Email and password are required");

  // The environment account is checked first so it keeps working even when the
  // database is unreachable or its record has been lost.
  const fromEnv = await checkEnvAdmin(email, password);
  if (fromEnv) {
    await createSession(fromEnv);
    return json({
      ok: true,
      via: "env",
      user: { email: fromEnv.email, name: fromEnv.name, role: fromEnv.role },
    });
  }

  await connectDB();
  const user = await AdminUser.findOne({ email });
  // Same message and roughly the same work either way, so the response does not
  // reveal whether the address exists.
  const hash = user?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidiu";
  const ok = await bcrypt.compare(password, hash);

  if (!user || !ok || !user.active) return fail("Those details do not match", 401);

  await AdminUser.updateOne({ _id: user._id }, { lastLoginAt: new Date() });
  await createSession({
    sub: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return json({ ok: true, user: { email: user.email, name: user.name, role: user.role } });
}
