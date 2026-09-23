import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { assertUniqueSlug, omit, requireAdmin, revalidate, slugify } from "../access";

const fields = {
  title: v.string(),
  slug: v.string(),
  summary: v.string(),
  body: v.string(),
  startsAt: v.number(),
  endsAt: v.optional(v.number()),
  venue: v.string(),
  city: v.string(),
  coverUrl: v.optional(v.string()),
  pillars: v.array(v.string()),
  albumId: v.optional(v.id("albums")),
  rsvpEnabled: v.boolean(),
  isPublished: v.boolean(),
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const events = await ctx.db.query("events").collect();
    return Promise.all(
      events
        .sort((a, b) => b.startsAt - a.startsAt)
        .map(async (row) => {
          const e = omit(row, "body");
          const rsvps = await ctx.db
            .query("rsvps")
            .withIndex("by_event", (q) => q.eq("eventId", e._id))
            .collect();
          return { ...e, rsvpCount: rsvps.length, attendeeCount: rsvps.reduce((n, r) => n + r.attendees, 0) };
        }),
    );
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const eventId = ctx.db.normalizeId("events", id);
    return eventId ? ctx.db.get(eventId) : null;
  },
});

export const rsvps = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    await requireAdmin(ctx);
    const rows = await ctx.db
      .query("rsvps")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
    return rows.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const save = mutation({
  args: { id: v.optional(v.id("events")), ...fields },
  handler: async (ctx, { id, ...doc }) => {
    await requireAdmin(ctx);
    doc.title = doc.title.trim();
    doc.slug = slugify(doc.slug || doc.title);
    if (!doc.title) throw new ConvexError("A title is required.");
    if (doc.endsAt !== undefined && doc.endsAt < doc.startsAt) throw new ConvexError("The event ends before it starts.");
    if (doc.isPublished && (!doc.summary.trim() || !doc.venue.trim() || !doc.city.trim())) {
      throw new ConvexError("Add a summary, venue and city before publishing.");
    }
    await assertUniqueSlug(ctx, "events", doc.slug, id);
    let eventId = id;
    if (eventId) await ctx.db.patch(eventId, doc);
    else eventId = await ctx.db.insert("events", doc);
    await revalidate(ctx, "events");
    return eventId;
  },
});

export const setPublished = mutation({
  args: { id: v.id("events"), isPublished: v.boolean() },
  handler: async (ctx, { id, isPublished }) => {
    await requireAdmin(ctx);
    const e = await ctx.db.get(id);
    if (!e) throw new ConvexError("That event no longer exists.");
    if (isPublished && (!e.summary.trim() || !e.venue.trim() || !e.city.trim())) {
      throw new ConvexError("Add a summary, venue and city before publishing.");
    }
    await ctx.db.patch(id, { isPublished });
    await revalidate(ctx, "events");
  },
});

export const remove = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const rsvps = await ctx.db
      .query("rsvps")
      .withIndex("by_event", (q) => q.eq("eventId", id))
      .collect();
    for (const r of rsvps) await ctx.db.delete(r._id);
    await ctx.db.delete(id);
    await revalidate(ctx, "events");
  },
});

export const removeRsvp = mutation({
  args: { id: v.id("rsvps") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
  },
});
