import { timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import type { Session } from "./session";
import type { AdminRole } from "./models/AdminUser";

/**
 * A staff login defined entirely by environment variables, with no database
 * record. It means a fresh deployment can be signed into before anything has
 * been seeded, and it keeps working if the database account is lost.
 *
 *   ADMIN_LOGIN_EMAIL          the username
 *   ADMIN_LOGIN_PASSWORD       plain text, or…
 *   ADMIN_LOGIN_PASSWORD_HASH  a bcrypt hash from `npm run make-admin` (preferred)
 *   ADMIN_LOGIN_NAME           display name, optional
 *   ADMIN_LOGIN_ROLE           owner | manager | staff, defaults to owner
 */
export type EnvAdmin = {
  email: string;
  name: string;
  role: AdminRole;
  password?: string;
  hash?: string;
};

/** A bcrypt hash is exactly 60 characters: $2a/2b/2y, a cost, then 53 more. */
const BCRYPT = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

export function envAdmin(): EnvAdmin | null {
  const email = process.env.ADMIN_LOGIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_LOGIN_PASSWORD;
  const raw = process.env.ADMIN_LOGIN_PASSWORD_HASH;

  // A .env file expands $2b, $12 and so on as variable references, which
  // quietly truncates the hash and turns this into a login that can never
  // succeed. Say so loudly rather than falling through to the database.
  let hash = raw;
  if (raw && !BCRYPT.test(raw)) {
    console.error(
      `[admin] ADMIN_LOGIN_PASSWORD_HASH is not a valid bcrypt hash — got ${raw.length} ` +
        "characters, expected 60. In a .env file every $ must be escaped as \\$; " +
        "in a hosting dashboard paste it unescaped. Ignoring it.",
    );
    hash = undefined;
  }

  // Both halves are required; a username with no secret is not a login.
  if (!email || (!password && !hash)) return null;

  const role = (process.env.ADMIN_LOGIN_ROLE?.trim() || "owner") as AdminRole;
  return {
    email,
    name: process.env.ADMIN_LOGIN_NAME?.trim() || "Store owner",
    role: (["owner", "manager", "staff"] as const).includes(role) ? role : "owner",
    password,
    hash,
  };
}

/** Constant-time compare so the response time does not leak the password. */
function sameSecret(a: string, b: string) {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  // timingSafeEqual throws on a length mismatch, which would itself be a leak.
  if (left.length !== right.length) {
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

/** A session for the env-defined admin, or null if it does not match. */
export async function checkEnvAdmin(
  email: string,
  password: string,
): Promise<Session | null> {
  const admin = envAdmin();
  if (!admin) return null;
  if (!sameSecret(email.toLowerCase().trim(), admin.email)) return null;

  const ok = admin.hash
    ? await bcrypt.compare(password, admin.hash)
    : sameSecret(password, admin.password ?? "");

  if (!ok) return null;

  return {
    // Marks the session as coming from the environment rather than a document.
    sub: "env-admin",
    email: admin.email,
    name: admin.name,
    role: admin.role,
  };
}
