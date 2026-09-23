import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { assertUniqueSlug, requireAdmin, revalidate, slugify } from "../access";

const fields = {
  name: v.string(),
  slug: v.string(),
  acronym: v.optional(v.string()),
  aliases: v.array(v.string()),
  mda: v.string(),
  mdaCategory: v.union(v.literal("ministry"), v.literal("department"), v.literal("agency"), v.literal("parastatal")),
  stateCode: v.string(),
  city: v.optional(v.string()),
  address: v.optional(v.string()),
  about: v.optional(v.string()),
  logoUrl: v.optional(v.string()),
  foundedYear: v.optional(v.number()),
  affiliatedYear: v.optional(v.number()),
  membershipBand: v.optional(v.string()),
  membershipSize: v.optional(v.number()),
  membershipStatus: v.optional(v.union(v.literal("active"), v.literal("provisional"))),
  services: v.array(v.string()),
  committee: v.optional(v.array(v.object({ name: v.string(), office: v.string() }))),
  contactEmail: v.optional(v.string()),
  contactPhone: v.optional(v.string()),
  website: v.optional(v.string()),
  isVerified: v.boolean(),
  isRegistered: v.optional(v.boolean()),
  isPublished: v.boolean(),
};

const flag = v.union(v.literal("isPublished"), v.literal("isVerified"), v.literal("isRegistered"));

/** Lightweight rows for the table; the editor loads the full document. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("cooperatives").collect();
    return rows
      .map((c) => ({
        _id: c._id,
        name: c.name ?? "(unnamed)",
        slug: c.slug ?? "",
        acronym: c.acronym,
        mda: c.mda ?? "",
        stateCode: c.stateCode ?? "",
        isPublished: c.isPublished ?? false,
        isVerified: c.isVerified ?? false,
        isRegistered: c.isRegistered ?? false,
        isTestData: c.isTestData ?? false,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const coopId = ctx.db.normalizeId("cooperatives", id);
    return coopId ? ctx.db.get(coopId) : null;
  },
});

export const save = mutation({
  args: { id: v.optional(v.id("cooperatives")), ...fields },
  handler: async (ctx, { id, ...doc }) => {
    await requireAdmin(ctx);
    doc.name = doc.name.trim();
    doc.slug = slugify(doc.slug || doc.name);
    if (!doc.name || !doc.mda.trim() || !doc.stateCode) throw new ConvexError("Name, MDA and state are required.");
    await assertUniqueSlug(ctx, "cooperatives", doc.slug, id);
    if (id) await ctx.db.patch(id, doc);
    else id = await ctx.db.insert("cooperatives", doc);
    await revalidate(ctx, "cooperatives");
    return id;
  },
});

export const setFlag = mutation({
  args: { id: v.id("cooperatives"), flag, value: v.boolean() },
  handler: async (ctx, { id, flag, value }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { [flag]: value });
    await revalidate(ctx, "cooperatives");
  },
});

export const remove = mutation({
  args: { id: v.id("cooperatives") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
    await revalidate(ctx, "cooperatives");
  },
});
