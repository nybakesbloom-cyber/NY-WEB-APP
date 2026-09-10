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

/* ------------------------------------------------------------------ *
 * Pagination
 * ------------------------------------------------------------------ */

export type Page = { page: number; limit: number; skip: number };

/** Reads ?page and ?limit, clamped so a caller cannot ask for the whole table. */
export function paging(req: Request, fallbackLimit = 25): Page {
  const q = new URL(req.url).searchParams;
  const page = Math.max(1, Number(q.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(q.get("limit")) || fallbackLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export function paged<T>(items: T[], total: number, { page, limit }: Page) {
  const pages = Math.max(1, Math.ceil(total / limit));
  const current = Math.min(page, pages);
  return {
    items,
    page: current,
    pages,
    total,
    limit,
    from: total === 0 ? 0 : (current - 1) * limit + 1,
    to: Math.min(current * limit, total),
  };
}

/**
 * Count first, then fetch. Asking for page 99 of 5 should return page 5's rows,
 * not an empty list with a header claiming to be page 5.
 */
export async function findPaged<T>(
  count: () => Promise<number>,
  find: (skip: number, limit: number) => Promise<T[]>,
  page: Page,
) {
  const total = await count();
  const pages = Math.max(1, Math.ceil(total / page.limit));
  const current = Math.min(page.page, pages);
  const items = await find((current - 1) * page.limit, page.limit);
  return paged(items, total, { ...page, page: current });
}
