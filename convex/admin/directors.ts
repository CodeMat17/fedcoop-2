import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin, revalidate } from "../access";

const fields = {
  name: v.string(),
  office: v.string(),
  cooperative: v.optional(v.string()),
  mda: v.optional(v.string()),
  bio: v.optional(v.string()),
  photoUrl: v.optional(v.string()),
  isExecutive: v.boolean(),
  isPublished: v.boolean(),
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.db.query("directors").withIndex("by_order").collect();
  },
});

export const save = mutation({
  args: { id: v.optional(v.id("directors")), ...fields },
  handler: async (ctx, { id, ...doc }) => {
    await requireAdmin(ctx);
    if (!doc.name.trim() || !doc.office.trim()) throw new ConvexError("Name and office are required.");
    if (id) {
      await ctx.db.patch(id, doc);
    } else {
      const last = await ctx.db.query("directors").withIndex("by_order").order("desc").first();
      id = await ctx.db.insert("directors", { ...doc, order: (last?.order ?? -1) + 1 });
    }
    await revalidate(ctx, "directors");
    return id;
  },
});

export const reorder = mutation({
  args: { ids: v.array(v.id("directors")) },
  handler: async (ctx, { ids }) => {
    await requireAdmin(ctx);
    for (const [order, id] of ids.entries()) await ctx.db.patch(id, { order });
    await revalidate(ctx, "directors");
  },
});

export const remove = mutation({
  args: { id: v.id("directors") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
    await revalidate(ctx, "directors");
  },
});
