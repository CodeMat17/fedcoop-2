import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { slugify } from "./slug";

export { slugify };

/*
 * Authorisation lives here, not in Clerk. Clerk proves who the caller is;
 * the `users` row decides what they may do. Every admin function starts with
 * requireAdmin, so a signed-in user without the role gets nothing back.
 */

export const ROLES = ["admin"] as const;
export type Role = (typeof ROLES)[number];

/** A copy of `obj` without `key` (e.g. drop large bodies from list queries). */
export function omit<T extends object, K extends keyof T>(obj: T, key: K): Omit<T, K> {
  const copy = { ...obj };
  delete copy[key];
  return copy;
}

export async function currentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await currentUser(ctx);
  if (!user || user.role !== "admin") throw new ConvexError("You do not have access to the admin.");
  return user;
}

/** Refreshes the statically rendered public pages that read these tags (§18.2). */
export async function revalidate(ctx: MutationCtx, ...tags: string[]) {
  await ctx.scheduler.runAfter(0, internal.revalidate.tags, { tags });
}

/** Rejects a slug already used by another row of the same table. */
export async function assertUniqueSlug(
  ctx: QueryCtx | MutationCtx,
  table: "posts" | "events" | "albums" | "cooperatives",
  slug: string,
  selfId?: string,
) {
  if (!slug) throw new ConvexError("A slug is required.");
  const clash = await ctx.db
    .query(table)
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
  if (clash && clash._id !== selfId) throw new ConvexError(`The slug "${slug}" is already in use.`);
}
