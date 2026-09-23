import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { assertUniqueSlug, omit, requireAdmin, revalidate, slugify } from "../access";

const fields = {
  title: v.string(),
  slug: v.string(),
  excerpt: v.string(),
  body: v.string(),
  coverUrl: v.optional(v.string()),
  coverAlt: v.optional(v.string()),
  pillars: v.array(v.string()),
  author: v.optional(v.string()),
  publishedAt: v.number(),
  isPublished: v.boolean(),
};

const isEmptyHtml = (html: string) => html.replace(/<[^>]*>/g, "").trim() === "" && !/<img/i.test(html);

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("posts").collect();
    return rows.sort((a, b) => b.publishedAt - a.publishedAt).map((row) => omit(row, "body"));
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const postId = ctx.db.normalizeId("posts", id);
    return postId ? ctx.db.get(postId) : null;
  },
});

export const save = mutation({
  args: { id: v.optional(v.id("posts")), ...fields },
  handler: async (ctx, { id, ...doc }) => {
    await requireAdmin(ctx);
    doc.title = doc.title.trim();
    doc.slug = slugify(doc.slug || doc.title);
    if (!doc.title) throw new ConvexError("A title is required.");
    if (doc.coverUrl && !doc.coverAlt?.trim()) throw new ConvexError("Describe the cover image (alt text) before saving.");
    if (doc.isPublished) {
      if (!doc.excerpt.trim()) throw new ConvexError("Add an excerpt before publishing.");
      if (isEmptyHtml(doc.body)) throw new ConvexError("The article body is empty.");
    }
    await assertUniqueSlug(ctx, "posts", doc.slug, id);
    let postId = id;
    if (postId) await ctx.db.patch(postId, doc);
    else postId = await ctx.db.insert("posts", doc);
    await revalidate(ctx, "posts");
    return postId;
  },
});

export const setPublished = mutation({
  args: { id: v.id("posts"), isPublished: v.boolean() },
  handler: async (ctx, { id, isPublished }) => {
    await requireAdmin(ctx);
    const post = await ctx.db.get(id);
    if (!post) throw new ConvexError("That article no longer exists.");
    if (isPublished && (!post.excerpt.trim() || isEmptyHtml(post.body))) {
      throw new ConvexError("Add an excerpt and body before publishing.");
    }
    await ctx.db.patch(id, { isPublished });
    await revalidate(ctx, "posts");
  },
});

export const remove = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
    await revalidate(ctx, "posts");
  },
});
