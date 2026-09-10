import mongoose from "mongoose";
import { connectDB } from "@/server/db";

export const dynamic = "force-dynamic";

/**
 * Says whether the deployment can reach its database, without exposing the
 * credentials. Next hides server errors behind a digest in production, so
 * without this a misconfigured MONGODB_URI is just an opaque 500.
 */
function describeUri(uri: string | undefined) {
  if (!uri) return { configured: false, host: null, database: null };
  try {
    // Never echo the credentials back, only where it is pointing.
    const withoutScheme = uri.replace(/^mongodb(\+srv)?:\/\//, "");
    const afterCredentials = withoutScheme.includes("@")
      ? withoutScheme.slice(withoutScheme.lastIndexOf("@") + 1)
      : withoutScheme;
    const [hostPart, ...rest] = afterCredentials.split("/");
    const database = (rest.join("/").split("?")[0] || "").trim();
    return {
      configured: true,
      host: hostPart || null,
      database: database || "(none — the driver will use 'test')",
      hasCredentials: withoutScheme.includes("@"),
    };
  } catch {
    return { configured: true, host: null, database: null };
  }
}

/** Strip anything credential-shaped out of a driver error. */
function safeMessage(err: unknown) {
  const raw = err instanceof Error ? err.message : String(err);
  return raw.replace(/mongodb(\+srv)?:\/\/[^\s]*/gi, "<connection string redacted>");
}

export async function GET() {
  const uri = describeUri(process.env.MONGODB_URI);
  const secretSet = !!process.env.ADMIN_SESSION_SECRET;

  if (!uri.configured) {
    return Response.json(
      {
        ok: false,
        problem: "MONGODB_URI is not set on this deployment",
        fix: "Add it under Project Settings → Environment Variables, then redeploy — env changes do not apply to an existing deployment.",
        env: { MONGODB_URI: false, ADMIN_SESSION_SECRET: secretSet },
      },
      { status: 503 },
    );
  }

  try {
    await connectDB();
    const db = mongoose.connection;
    const counts = {
      products: await db.collection("products").countDocuments(),
      content: await db.collection("contents").countDocuments(),
      admins: await db.collection("adminusers").countDocuments(),
      orders: await db.collection("orders").countDocuments(),
    };

    const empty = counts.products === 0;
    return Response.json({
      ok: !empty,
      database: { host: uri.host, name: db.name, state: "connected" },
      counts,
      ...(empty
        ? { problem: "Connected, but the database is empty.", fix: "Run `npm run seed` against this MONGODB_URI." }
        : {}),
      ...(db.name === "test"
        ? {
            warning:
              "MONGODB_URI has no database name, so the driver fell back to 'test'. Add it before the '?': …mongodb.net/ny_bakes_bloom?retryWrites=true&w=majority",
          }
        : {}),
      env: { MONGODB_URI: true, ADMIN_SESSION_SECRET: secretSet },
    });
  } catch (err) {
    const code = (err as { code?: number }).code;
    const message = safeMessage(err);

    // Atlas reports an unreachable cluster as a server-selection failure whose
    // text names the IP allowlist — match that explicitly rather than falling
    // through to a generic message.
    const blockedByAllowlist =
      /whitelist|not authorized to connect|Could not connect to any servers/i.test(message);

    const fix = blockedByAllowlist
      ? "Vercel's IP addresses are not in the Atlas allowlist. In Atlas → Network Access → Add IP Address → Allow access from anywhere (0.0.0.0/0). Vercel has no fixed egress IPs, so a narrower range will not work."
      : code === 8000 || /bad auth|authentication failed/i.test(message)
        ? "The username or password in MONGODB_URI is wrong. Copy the string from Atlas → Connect → Drivers, replace <db_password>, and percent-encode any special characters (@ is %40)."
        : /ENOTFOUND|querySrv|ESERVFAIL/i.test(message)
          ? "The cluster hostname does not resolve. Check it against Atlas → Connect → Drivers."
          : /timed out|ETIMEDOUT|ECONNREFUSED/i.test(message)
            ? "Reached the DNS but not the server. In Atlas → Network Access, allow 0.0.0.0/0 so Vercel can connect."
            : "See the message above.";

    return Response.json(
      {
        ok: false,
        database: { host: uri.host, name: uri.database, state: "failed" },
        problem: message,
        code: code ?? null,
        fix,
        env: { MONGODB_URI: true, ADMIN_SESSION_SECRET: secretSet },
      },
      { status: 503 },
    );
  }
}
