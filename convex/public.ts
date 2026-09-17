import { query, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

/* Every public query filters isPublished at the index level (§16). */

export const cooperatives = query({
  args: {},
  handler: (ctx) =>
    ctx.db
      .query("cooperatives")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect(),
});

export const cooperativeBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const row = await ctx.db
      .query("cooperatives")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    return row && row.isPublished ? row : null;
  },
});

export const searchCooperatives = query({
  args: { term: v.string() },
  handler: (ctx, { term }) =>
    ctx.db
      .query("cooperatives")
      .withSearchIndex("search_name", (q) => q.search("name", term).eq("isPublished", true))
      .take(50),
});

/** Only verified rows with a count and a verification stamp are ever returned (§13.2). */
export const stateStats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("stateStats")
      .withIndex("by_verified", (q) => q.eq("verified", true))
      .collect();
    return rows
      .filter((r) => r.cooperativeCount !== undefined && r.verifiedAt !== undefined)
      .map((r) => ({
        stateCode: r.stateCode,
        stateName: r.stateName,
        cooperativeCount: r.cooperativeCount as number,
        verifiedAt: r.verifiedAt as number,
      }));
  },
});

export const siteStats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("siteStats").collect();
    return rows
      .filter((r) => r.verified && r.value !== undefined && r.verifiedAt !== undefined)
      .map((r) => ({
        key: r.key,
        value: r.value as number,
        label: r.label,
        verifiedAt: r.verifiedAt as number,
      }));
  },
});

export const directors = query({
  args: {},
  handler: (ctx) =>
    ctx.db
      .query("directors")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect(),
});

export const posts = query({
  args: {},
  handler: (ctx) =>
    ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .order("desc")
      .collect(),
});

export const postBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const row = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    return row && row.isPublished ? row : null;
  },
});

async function withAlbumSlug(ctx: QueryCtx, e: Doc<"events">) {
  const album = e.albumId ? await ctx.db.get(e.albumId) : null;
  return { ...e, albumSlug: album && album.isPublished ? album.slug : undefined };
}

export const events = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("events")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();
    return Promise.all(rows.map((e) => withAlbumSlug(ctx, e)));
  },
});

export const eventBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const row = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    return row && row.isPublished ? withAlbumSlug(ctx, row) : null;
  },
});

async function albumSummary(ctx: QueryCtx, album: Doc<"albums">) {
  const photos = await ctx.db
    .query("photos")
    .withIndex("by_album", (q) => q.eq("albumId", album._id))
    .collect();
  const chosen = album.coverPhotoIds
    .map((id) => photos.find((p) => p._id === id))
    .filter((p): p is Doc<"photos"> => Boolean(p));
  const covers = (chosen.length ? chosen : photos).slice(0, 4);
  return { album, photos, covers };
}

export const albums = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("albums")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .order("desc")
      .collect();
    return Promise.all(
      rows.map(async (a) => {
        const { photos, covers } = await albumSummary(ctx, a);
        return { ...a, covers, photoCount: photos.length };
      }),
    );
  },
});

export const albumBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const a = await ctx.db
      .query("albums")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!a || !a.isPublished) return null;
    const { photos, covers } = await albumSummary(ctx, a);
    return { ...a, covers, photos, photoCount: photos.length };
  },
});

export const resources = query({
  args: {},
  handler: (ctx) =>
    ctx.db
      .query("resources")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .order("desc")
      .collect(),
});

export const pages = query({
  args: { keys: v.array(v.string()) },
  handler: async (ctx, { keys }) => {
    const rows = await Promise.all(
      keys.map((key) =>
        ctx.db
          .query("pages")
          .withIndex("by_key", (q) => q.eq("key", key))
          .unique(),
      ),
    );
    return rows.filter((r): r is Doc<"pages"> => r !== null && r.body.trim() !== "");
  },
});

export const testimonials = query({
  args: {},
  handler: (ctx) =>
    ctx.db
      .query("testimonials")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect(),
});

export const milestones = query({
  args: {},
  handler: (ctx) =>
    ctx.db
      .query("milestones")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect(),
});

export const partners = query({
  args: {},
  handler: (ctx) =>
    ctx.db
      .query("partners")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect(),
});

export const benefits = query({
  args: {},
  handler: (ctx) =>
    ctx.db
      .query("benefits")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect(),
});
