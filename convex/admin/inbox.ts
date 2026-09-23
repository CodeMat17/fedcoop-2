import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "../access";

const status = v.union(v.literal("new"), v.literal("in-progress"), v.literal("closed"));

/* Enquiries inbox and newsletter subscribers: private data, never revalidated. */

export const enquiries = query({
  args: { status: v.optional(status) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const q = args.status
      ? ctx.db.query("enquiries").withIndex("by_status", (q) => q.eq("status", args.status!))
      : ctx.db.query("enquiries");
    const rows = await q.collect();
    return rows.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const updateEnquiry = mutation({
  args: { id: v.id("enquiries"), status: v.optional(status), note: v.optional(v.string()) },
  handler: async (ctx, { id, ...patch }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, patch);
  },
});

export const removeEnquiry = mutation({
  args: { id: v.id("enquiries") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
  },
});

export const subscribers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("subscribers").collect();
    return rows.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const removeSubscriber = mutation({
  args: { id: v.id("subscribers") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
  },
});

export const newCount = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db
      .query("enquiries")
      .withIndex("by_status", (q) => q.eq("status", "new"))
      .collect();
    return rows.length;
  },
});
