import bcrypt from "bcryptjs";
import { connectDB } from "@/server/db";
import { AdminUser } from "@/server/models/AdminUser";
import { createSession } from "@/server/session";
import { fail, json } from "@/server/api";
import { envAdmin } from "@/server/envAdmin";

/**
 * First-run bootstrap. A brand-new database has no staff account, so there
 * would be no way into the admin without a terminal. Both handlers refuse the
 * moment any account exists, so this closes itself permanently after one use.
 */
async function isFirstRun() {
  // An environment login is already a way in, so setup should not offer.
  if (envAdmin()) return false;
  await connectDB();
  return (await AdminUser.estimatedDocumentCount()) === 0;
}

export async function GET() {
  try {
    return json({ needsSetup: await isFirstRun() });
  } catch {
    // No database yet — the login page falls back to the normal form.
    return json({ needsSetup: false, databaseUnreachable: true });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await isFirstRun())) {
      return fail("An account already exists. Sign in instead.", 409);
    }

    const { email, password, name } = await req.json();
    const address = String(email ?? "").toLowerCase().trim();
    const secret = String(password ?? "");

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(address)) return fail("That is not a valid email address");
    if (secret.length < 10) return fail("Use a password of at least 10 characters");

    const user = await AdminUser.create({
      email: address,
      name: String(name ?? "").trim() || "Store owner",
      passwordHash: await bcrypt.hash(secret, 12),
      role: "owner",
    });

    await createSession({
      sub: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return json({ ok: true, email: user.email }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Setup failed";
    if (message.includes("E11000")) return fail("An account already exists. Sign in instead.", 409);
    console.error("[admin setup]", err);
    return fail("Could not reach the database. Check MONGODB_URI.", 503);
  }
}
