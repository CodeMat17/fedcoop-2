import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { omit, requireAdmin, revalidate } from "../access";

/* Editable prose blocks read by the public pages via getPages([...keys]). */

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("pages").collect();
    return rows.map((r) => ({ ...omit(r, "body"), isEmpty: r.body.replace(/<[^>]*>/g, "").trim() === "" }));
  },
});

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    await requireAdmin(ctx);
    return ctx.db
      .query("pages")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
  },
});

export const save = mutation({
  args: { key: v.string(), title: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (!args.title.trim()) throw new ConvexError("A title is required.");
    const existing = await ctx.db
      .query("pages")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    const row = { ...args, updatedAt: Date.now() };
    if (existing) await ctx.db.patch(existing._id, row);
    else await ctx.db.insert("pages", row);
    await revalidate(ctx, "pages");
  },
});
