import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { AdminRole } from "./models/AdminUser";

const COOKIE = "nybb_admin";
const MAX_AGE = 60 * 60 * 12; // 12 hours

export type Session = {
  sub: string;
  email: string;
  name: string;
  role: AdminRole;
};

function secret() {
  const raw = process.env.ADMIN_SESSION_SECRET;
  if (!raw) throw new Error("ADMIN_SESSION_SECRET is not set");
  return new TextEncoder().encode(raw);
}

export async function createSession(session: Session) {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** The signed-in admin, or null. Never throws on a bad or missing cookie. */
export async function getSession(): Promise<Session | null> {
  try {
    const token = (await cookies()).get(COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret());
    return {
      sub: String(payload.sub),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role as AdminRole,
    };
  } catch {
    return null;
  }
}

export class Unauthorized extends Error {
  constructor() {
    super("Not signed in");
  }
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new Unauthorized();
  return session;
}
