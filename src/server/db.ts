import mongoose from "mongoose";

const URI = process.env.MONGODB_URI;

/**
 * Next reloads modules on every edit in dev and reuses warm lambdas in
 * production, so the connection is cached on globalThis. Without this you end
 * up with a new pool per reload and mongod refuses connections.
 */
type Cache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = globalThis as unknown as { _mongoose?: Cache };
const cache: Cache = (globalWithMongoose._mongoose ??= { conn: null, promise: null });

export async function connectDB() {
  if (cache.conn) return cache.conn;

  if (!URI) {
    throw new Error(
      "MONGODB_URI is not set. Locally: copy .env.example to .env.local. " +
        "On Vercel: add MONGODB_URI and ADMIN_SESSION_SECRET under Project " +
        "Settings → Environment Variables, pointing at a reachable database " +
        "(Atlas, not 127.0.0.1).",
    );
  }

  cache.promise ??= mongoose
    .connect(URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    })
    .catch((err) => {
      // Let the next request try again rather than caching a rejected promise.
      cache.promise = null;
      throw err;
    });

  cache.conn = await cache.promise;
  return cache.conn;
}
