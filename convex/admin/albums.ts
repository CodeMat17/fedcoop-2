import { ConvexError, v } from "convex/values";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { mutation, query, type MutationCtx } from "../_generated/server";
import { assertUniqueSlug, requireAdmin, revalidate, slugify } from "../access";

const albumFields = {
  title: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  category: v.string(),
  date: v.number(),
  isPublished: v.boolean(),
};

const photoFields = {
  publicId: v.string(),
  width: v.number(),
  height: v.number(),
  blurDataUrl: v.optional(v.string()),
  alt: v.string(),
  caption: v.optional(v.string()),
  category: v.optional(v.string()),
  takenAt: v.optional(v.number()),
};

const orientation = (w: number, h: number) =>
  Math.abs(w - h) / Math.max(w, h) < 0.05 ? ("square" as const) : w > h ? ("landscape" as const) : ("portrait" as const);

async function photosOf(ctx: MutationCtx, albumId: Id<"albums">) {
  return ctx.db
    .query("photos")
    .withIndex("by_album", (q) => q.eq("albumId", albumId))
    .collect();
}

/** Every image needs alt text before the album can be public (§14.4). */
async function assertPublishable(ctx: MutationCtx, albumId: Id<"albums">) {
  const missing = (await photosOf(ctx, albumId)).filter((p) => !p.alt.trim()).length;
  if (missing) {
    throw new ConvexError(`${missing} photo${missing === 1 ? " needs" : "s need"} alt text before this album can be published.`);
  }
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const albums = await ctx.db.query("albums").collect();
    return Promise.all(
      albums
        .sort((a, b) => b.date - a.date)
        .map(async (a) => {
          const photos = await ctx.db
            .query("photos")
            .withIndex("by_album", (q) => q.eq("albumId", a._id))
            .collect();
          const cover = photos.find((p) => p._id === a.coverPhotoIds[0]) ?? photos[0];
          return {
            ...a,
            photoCount: photos.length,
            missingAlt: photos.filter((p) => !p.alt.trim()).length,
            cover: cover?.publicId,
          };
        }),
    );
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const albumId = ctx.db.normalizeId("albums", id);
    const album = albumId ? await ctx.db.get(albumId) : null;
    if (!album) return null;
    const photos = await ctx.db
      .query("photos")
      .withIndex("by_album", (q) => q.eq("albumId", album._id))
      .collect();
    return { album, photos };
  },
});

export const save = mutation({
  args: { id: v.optional(v.id("albums")), ...albumFields },
  handler: async (ctx, { id, ...doc }) => {
    await requireAdmin(ctx);
    doc.title = doc.title.trim();
    doc.slug = slugify(doc.slug || doc.title);
    if (!doc.title) throw new ConvexError("A title is required.");
    await assertUniqueSlug(ctx, "albums", doc.slug, id);
    if (id) {
      if (doc.isPublished) await assertPublishable(ctx, id);
      await ctx.db.patch(id, doc);
    }
    // A new album starts as a draft: it has no photos (and so no alt text) yet.
    const albumId = id ?? (await ctx.db.insert("albums", { ...doc, isPublished: false, coverPhotoIds: [] }));
    await revalidate(ctx, "gallery", "events");
    return albumId;
  },
});

export const setPublished = mutation({
  args: { id: v.id("albums"), isPublished: v.boolean() },
  handler: async (ctx, { id, isPublished }) => {
    await requireAdmin(ctx);
    if (isPublished) await assertPublishable(ctx, id);
    await ctx.db.patch(id, { isPublished });
    await revalidate(ctx, "gallery", "events");
  },
});

export const remove = mutation({
  args: { id: v.id("albums") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    for (const p of await photosOf(ctx, id)) {
      await ctx.db.delete(p._id);
      await ctx.scheduler.runAfter(0, internal.cloudinary.destroy, { publicId: p.publicId });
    }
    for (const e of await ctx.db.query("events").collect()) {
      if (e.albumId === id) await ctx.db.patch(e._id, { albumId: undefined });
    }
    await ctx.db.delete(id);
    await revalidate(ctx, "gallery", "events");
  },
});

export const addPhotos = mutation({
  args: { albumId: v.id("albums"), photos: v.array(v.object(photoFields)) },
  handler: async (ctx, { albumId, photos }) => {
    await requireAdmin(ctx);
    const existing = await photosOf(ctx, albumId);
    let order = existing.reduce((m, p) => Math.max(m, p.order), -1);
    for (const p of photos) {
      await ctx.db.insert("photos", { ...p, albumId, orientation: orientation(p.width, p.height), order: ++order });
    }
    await revalidate(ctx, "gallery");
  },
});

export const updatePhoto = mutation({
  args: { id: v.id("photos"), alt: v.string(), caption: v.optional(v.string()), category: v.optional(v.string()) },
  handler: async (ctx, { id, ...patch }) => {
    await requireAdmin(ctx);
    const photo = await ctx.db.get(id);
    if (!photo) throw new ConvexError("That photo no longer exists.");
    const album = await ctx.db.get(photo.albumId);
    if (album?.isPublished && !patch.alt.trim()) {
      throw new ConvexError("Photos in a published album must keep their alt text.");
    }
    await ctx.db.patch(id, { ...patch, alt: patch.alt.trim() });
    await revalidate(ctx, "gallery");
  },
});

export const removePhoto = mutation({
  args: { id: v.id("photos") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const photo = await ctx.db.get(id);
    if (!photo) return;
    const album = await ctx.db.get(photo.albumId);
    if (album) await ctx.db.patch(album._id, { coverPhotoIds: album.coverPhotoIds.filter((c) => c !== id) });
    await ctx.db.delete(id);
    await ctx.scheduler.runAfter(0, internal.cloudinary.destroy, { publicId: photo.publicId });
    await revalidate(ctx, "gallery");
  },
});

export const reorder = mutation({
  args: { albumId: v.id("albums"), ids: v.array(v.id("photos")) },
  handler: async (ctx, { albumId, ids }) => {
    await requireAdmin(ctx);
    for (const [order, id] of ids.entries()) {
      const photo = await ctx.db.get(id);
      if (photo?.albumId === albumId) await ctx.db.patch(id, { order });
    }
    await revalidate(ctx, "gallery");
  },
});

/** Up to four photos form the album's mosaic cover (§14.5). */
export const toggleCover = mutation({
  args: { albumId: v.id("albums"), photoId: v.id("photos") },
  handler: async (ctx, { albumId, photoId }) => {
    await requireAdmin(ctx);
    const album = await ctx.db.get(albumId);
    if (!album) throw new ConvexError("That album no longer exists.");
    const has = album.coverPhotoIds.includes(photoId);
    if (!has && album.coverPhotoIds.length >= 4) throw new ConvexError("An album cover holds four photos. Remove one first.");
    await ctx.db.patch(albumId, {
      coverPhotoIds: has ? album.coverPhotoIds.filter((c) => c !== photoId) : [...album.coverPhotoIds, photoId],
    });
    await revalidate(ctx, "gallery");
  },
});
