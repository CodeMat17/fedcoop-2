import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalMutation, type MutationCtx } from "./_generated/server";
import { REGISTER_MDAS, slugify, societyName } from "./register";
import { STATE_ROWS } from "./stateRows";

/*
 * Development seeding (§13.2, §20.5).
 *
 *   npx convex run seed:initStates   — creates the 37 state rows, all UNVERIFIED, no counts.
 *   npx convex run seed:testData     — inserts clearly-labelled [TEST] cooperatives.
 *   npx convex run seed:clearTestData
 *   npx convex run seed:importRegister — inserts the real member register (convex/register.ts).
 *   npx convex run seed:setRegistered '{"slug":"...","registered":true}' — marks a society (un)registered.
 *   npx convex run seed:setPage '{"key":"mission","title":"...","body":"<p>...</p>"}' — upserts a CMS page.
 *
 * testData never writes stateStats or siteStats, so no figure can reach the public
 * site without someone ticking "verified" on a real number.
 */

export const initStates = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const s of STATE_ROWS) {
      const existing = await ctx.db
        .query("stateStats")
        .withIndex("by_state", (q) => q.eq("stateCode", s.code))
        .unique();
      if (!existing) {
        await ctx.db.insert("stateStats", { stateCode: s.code, stateName: s.name, verified: false });
      }
    }
  },
});

const TEST = [
  { acronym: "NFVCB", mda: "National Film and Video Censors Board", aliases: ["film censors", "censors board"], stateCode: "NG-FC", mdaCategory: "agency" },
  { acronym: "CBN", mda: "Central Bank of Nigeria", aliases: ["central bank", "apex bank"], stateCode: "NG-FC", mdaCategory: "parastatal" },
  { acronym: "ICPC", mda: "Independent Corrupt Practices and Other Related Offences Commission", aliases: ["corrupt practices commission"], stateCode: "NG-FC", mdaCategory: "agency" },
  { acronym: "NTA", mda: "Nigerian Television Authority", aliases: ["television authority"], stateCode: "NG-LA", mdaCategory: "parastatal" },
  { acronym: "NBC", mda: "National Broadcasting Commission", aliases: ["broadcasting commission"], stateCode: "NG-FC", mdaCategory: "agency" },
  { acronym: "EFCC", mda: "Economic and Financial Crimes Commission", aliases: ["financial crimes"], stateCode: "NG-FC", mdaCategory: "agency" },
  { acronym: "NCC", mda: "Nigerian Communications Commission", aliases: ["communications commission"], stateCode: "NG-FC", mdaCategory: "agency" },
  { acronym: "NNPC", mda: "Nigerian National Petroleum Company", aliases: ["petroleum", "nnpc limited"], stateCode: "NG-RI", mdaCategory: "parastatal" },
  { acronym: "FMAFS", mda: "Federal Ministry of Agriculture and Food Security", aliases: ["agriculture ministry"], stateCode: "NG-KD", mdaCategory: "ministry" },
  { acronym: "FMTI", mda: "Federal Ministry of Trade and Investment", aliases: ["trade ministry"], stateCode: "NG-EN", mdaCategory: "ministry" },
] as const;

export const testData = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const t of TEST) {
      const slug = `test-${t.acronym.toLowerCase()}`;
      const existing = await ctx.db
        .query("cooperatives")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (existing) continue;
      await ctx.db.insert("cooperatives", {
        name: `[TEST] ${t.acronym} Staff Multipurpose Cooperative Society`,
        slug,
        acronym: t.acronym,
        aliases: [...t.aliases],
        mda: t.mda,
        mdaCategory: t.mdaCategory,
        stateCode: t.stateCode,
        about: "<p>Test record for development. Replace with the verified register before launch.</p>",
        services: ["savings", "loans"],
        isVerified: false,
        isPublished: true,
        isTestData: true,
      });
    }
  },
});

/*
 * Imports the member register. Idempotent: societies already present (by slug) are skipped.
 * State defaults to the FCT (federal MDA headquarters) and category to "agency"; correct
 * individual records in the admin. Records are published but not verified.
 */
export const importRegister = internalMutation({
  args: {},
  handler: (ctx) => insertRegister(ctx),
});

async function insertRegister(ctx: MutationCtx) {
    let inserted = 0;
    for (const [i, mda] of REGISTER_MDAS.entries()) {
      const name = societyName(mda);
      const slug = slugify(mda);
      const existing = await ctx.db
        .query("cooperatives")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (existing) continue;
      await ctx.db.insert("cooperatives", {
        name,
        slug,
        aliases: [],
        mda,
        mdaCategory: mda.startsWith("Federal Ministry") ? "ministry" : "agency",
        stateCode: "NG-FC",
        services: [],
        isVerified: false,
        isPublished: true,
        order: i,
      });
      inserted++;
    }
    return { inserted, total: REGISTER_MDAS.length };
}

/* Testimonials from the previous site, keyed by the society name they were saved under. */
const LEGACY_TESTIMONIAL_MDA: Record<string, { society: string; mda: string }> = {
  "ICPC Staff Multipurpose Cooperative Society": { society: "ICPC Staff Multi-purpose Cooperative Society", mda: "Independent Corrupt Practices and Other Related Offences Commission" },
  "NLSSMCS Staff Multipurpose Cooperative Society": { society: "Nigerian Law School Staff Multipurpose Cooperative Society", mda: "Nigerian Law School" },
  "NPC Staff Multipurpose Cooperative Society": { society: "NPC Staff Multi-purpose Cooperative Society", mda: "National Population Commission" },
  "EFCC Staff Multipurpose Cooperative Society": { society: "EFCC Staff Multi-purpose Cooperative Society", mda: "Economic and Financial Crimes Commission" },
  "NFVCB Staff Multipurpose Cooperative Society": { society: "NFVCB Staff Multi-purpose Co-operative Society", mda: "National Film and Video Censors Board" },
};

/*
 * One-off move from the previous site's data model (run once, with schemaValidation off):
 * deletes old-format cooperative rows ({name, status, ...}), converts old testimonials
 * ({body, name, rating}) to the current shape, then imports the member register.
 */
export const migrateLegacy = internalMutation({
  args: {},
  handler: async (ctx) => {
    let removedCooperatives = 0;
    for (const r of await ctx.db.query("cooperatives").collect()) {
      if (typeof r.slug === "string" && Array.isArray(r.aliases)) continue;
      await ctx.db.delete(r._id);
      removedCooperatives++;
    }

    let convertedTestimonials = 0;
    const testimonials = (await ctx.db.query("testimonials").collect()) as Array<Record<string, unknown> & { _id: Id<"testimonials"> }>;
    for (const [i, t] of testimonials.entries()) {
      if (typeof t.quote === "string") continue;
      const legacyName = String(t.name ?? "");
      const known = LEGACY_TESTIMONIAL_MDA[legacyName];
      await ctx.db.replace(t._id, {
        quote: String(t.body ?? ""),
        name: known?.society ?? legacyName,
        role: "",
        cooperative: "",
        mda: known?.mda ?? "",
        order: i,
        isPublished: true,
      });
      convertedTestimonials++;
    }

    const register = await insertRegister(ctx);
    return { removedCooperatives, convertedTestimonials, ...register };
  },
});

export const clearTestData = internalMutation({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("cooperatives").collect();
    for (const r of rows) if (r.isTestData) await ctx.db.delete(r._id);
  },
});

export const setRegistered = internalMutation({
  args: { slug: v.string(), registered: v.boolean() },
  handler: async (ctx, { slug, registered }) => {
    const row = await ctx.db
      .query("cooperatives")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!row) throw new Error(`No cooperative with slug "${slug}"`);
    await ctx.db.patch(row._id, { isRegistered: registered });
    await ctx.scheduler.runAfter(0, internal.revalidate.tags, { tags: ["cooperatives"] });
  },
});

export const setPage = internalMutation({
  args: { key: v.string(), title: v.string(), body: v.string() },
  handler: async (ctx, { key, title, body }) => {
    const row = await ctx.db
      .query("pages")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    const doc = { key, title, body, updatedAt: Date.now() };
    if (row) await ctx.db.patch(row._id, doc);
    else await ctx.db.insert("pages", doc);
    await ctx.scheduler.runAfter(0, internal.revalidate.tags, { tags: ["pages"] });
  },
});
