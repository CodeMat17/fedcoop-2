import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { currentUser, requireAdmin } from "./access";

/** The signed-in caller and their role. Null when Convex has no valid Clerk session. */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await currentUser(ctx);
    return {
      name: user?.name ?? identity.name ?? null,
      email: user?.email ?? identity.email ?? null,
      role: user?.role ?? null,
    };
  },
});

/**
 * Records the Clerk user in Convex on every admin visit. It never sets a role:
 * a new account lands with none and sees "no access" until an admin grants it.
 * Email and name come from the JWT when Clerk includes them; the client values
 * are a display fallback only and are never used for authorisation.
 */
export const store = mutation({
  args: { email: v.optional(v.string()), name: v.optional(v.string()), imageUrl: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const fields = {
      clerkId: identity.subject,
      email: (identity.email ?? args.email)?.toLowerCase(),
      name: identity.name ?? args.name,
      imageUrl: identity.pictureUrl ?? args.imageUrl,
      lastSeenAt: Date.now(),
    };
    const existing = await currentUser(ctx);
    if (existing) {
      await ctx.db.patch(existing._id, fields);
      return existing._id;
    }
    return ctx.db.insert("users", { tokenIdentifier: identity.tokenIdentifier, ...fields });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const self = await requireAdmin(ctx);
    const rows = await ctx.db.query("users").collect();
    return rows
      .sort((a, b) => (a.role === b.role ? b.lastSeenAt - a.lastSeenAt : a.role ? -1 : 1))
      .map((u) => ({ ...u, isSelf: u._id === self._id }));
  },
});

export const setRole = mutation({
  args: { userId: v.id("users"), role: v.union(v.literal("admin"), v.null()) },
  handler: async (ctx, { userId, role }) => {
    const self = await requireAdmin(ctx);
    if (userId === self._id && role !== "admin") {
      throw new ConvexError("You cannot remove your own admin role. Ask another admin to do it.");
    }
    await ctx.db.patch(userId, { role: role ?? undefined });
  },
});

export const remove = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const self = await requireAdmin(ctx);
    if (userId === self._id) throw new ConvexError("You cannot remove your own account.");
    await ctx.db.delete(userId);
  },
});

/** Used by actions (which have no db) to check the caller's role. */
export const assertAdmin = internalQuery({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return true;
  },
});

/**
 * Bootstraps the first admin from the CLI. The person signs in once (and sees
 * "no access"), then:  npx convex run users:grantAdmin '{"email":"name@fedcoop.org"}'
 */
export const grantAdmin = internalMutation({
  args: { email: v.optional(v.string()), clerkId: v.optional(v.string()) },
  handler: async (ctx, { email, clerkId }) => {
    const rows = (await ctx.db.query("users").collect()).filter(
      (u) => (clerkId && u.clerkId === clerkId) || (email && u.email === email.toLowerCase()),
    );
    if (rows.length === 0) throw new ConvexError("No such user. They must sign in to /admin once first.");
    if (rows.length > 1) {
      throw new ConvexError(`Several accounts match; pass clerkId instead: ${rows.map((r) => r.clerkId).join(", ")}`);
    }
    await ctx.db.patch(rows[0]._id, { role: "admin" });
    return `${rows[0].email ?? rows[0].clerkId} is now an admin`;
  },
});
