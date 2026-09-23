import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin, revalidate } from "../access";

const fields = {
  title: v.string(),
  description: v.optional(v.string()),
  category: v.string(),
  pillars: v.optional(v.array(v.string())),
  fileUrl: v.string(),
  fileType: v.string(),
  fileSize: v.number(),
  isPublished: v.boolean(),
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("resources").collect();
    return rows.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const save = mutation({
  args: { id: v.optional(v.id("resources")), ...fields },
  handler: async (ctx, { id, ...doc }) => {
    await requireAdmin(ctx);
    if (!doc.title.trim() || !doc.category.trim()) throw new ConvexError("Title and category are required.");
    if (!doc.fileUrl) throw new ConvexError("Upload a file first.");
    const row = { ...doc, updatedAt: Date.now() };
    if (id) await ctx.db.patch(id, row);
    else id = await ctx.db.insert("resources", row);
    await revalidate(ctx, "resources");
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("resources") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
    await revalidate(ctx, "resources");
  },
});
