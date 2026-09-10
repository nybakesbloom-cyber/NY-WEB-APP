import { NextResponse } from "next/server";
import { connectDB } from "./db";
import { getSession, requireSession, Unauthorized, type Session } from "./session";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

type Ctx<P> = { req: Request; params: P; session: Session };
type NextCtx<P> = { params?: Promise<P> };

function toResponse(err: unknown) {
  if (err instanceof Unauthorized) return fail("Not signed in", 401);
  const message = err instanceof Error ? err.message : "Server error";
  if (message.includes("E11000")) return fail("That already exists", 409);
  if (message.includes("validation failed")) return fail(message, 422);
  console.error("[api]", err);
  return fail("Server error", 500);
}

/**
 * Connects to Mongo and requires a signed-in admin. Every /api/admin route goes
 * through this, so a route cannot be left open by forgetting a check.
 */
export function withAdmin<P = Record<string, string>>(
  handler: (ctx: Ctx<P>) => Promise<Response>,
) {
  return async (req: Request, ctx: NextCtx<P>): Promise<Response> => {
    try {
      await connectDB();
      const session = await requireSession();
      const params = ctx?.params ? await ctx.params : ({} as P);
      return await handler({ req, params, session });
    } catch (err) {
      return toResponse(err);
    }
  };
}

/** Public endpoints — DB connected, no auth. */
export function withDB<P = Record<string, string>>(
  handler: (ctx: { req: Request; params: P; session: Session | null }) => Promise<Response>,
) {
  return async (req: Request, ctx: NextCtx<P>): Promise<Response> => {
    try {
      await connectDB();
      const params = ctx?.params ? await ctx.params : ({} as P);
      return await handler({ req, params, session: await getSession() });
    } catch (err) {
      return toResponse(err);
    }
  };
}

export async function body<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new Error("Expected a JSON body");
  }
}

export function query(req: Request) {
  return new URL(req.url).searchParams;
}
