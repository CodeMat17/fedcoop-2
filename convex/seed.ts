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
 *   npx convex run seed:siteContent  — site stat rows, the about/mission/vision/values/privacy/terms
 *                                      pages and the testimonials.
 *   npx convex run seed:production   — initStates + siteContent + importRegister in one go, for a
 *                                      fresh deployment (add --prod). Never inserts test data.
 *
 * testData never writes stateStats or siteStats, so no figure can reach the public
 * site without someone ticking "verified" on a real number.
 */

export const initStates = internalMutation({
  args: {},
  handler: (ctx) => insertStates(ctx),
});

async function insertStates(ctx: MutationCtx) {
  let inserted = 0;
  for (const s of STATE_ROWS) {
    const existing = await ctx.db
      .query("stateStats")
      .withIndex("by_state", (q) => q.eq("stateCode", s.code))
      .unique();
    if (!existing) {
      await ctx.db.insert("stateStats", { stateCode: s.code, stateName: s.name, verified: false });
      inserted++;
    }
  }
  return { inserted, total: STATE_ROWS.length };
}

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

/*
 * Home page impact band (app/page.tsx IMPACT). Only "pillars" is a known fact (the six
 * pillars in lib/site.ts); the rest are created empty and unverified until FEDCOOP
 * supplies verified national figures in the admin.
 */
const SITE_STATS: { key: string; label: string; value?: number }[] = [
  { key: "memberSocieties", label: "member societies" },
  { key: "membersRepresented", label: "members represented" },
  { key: "statesCovered", label: "states covered, with the FCT" },
  { key: "pillars", label: "pillars of service", value: 6 },
];

const LEGAL_NAME = "Federal Civil Service Staff of Nigeria Cooperative Societies Union Limited";
const ADDRESS = "Federal Secretariat Complex, Phase 1, Abuja, FCT, Nigeria";
const EMAIL = "email@fedcoop.org";

/* Starting copy. "about" matches the page's built-in fallback. Values is a draft built on the
 * ICA cooperative values, pending FEDCOOP's official statement (spec §21). */
const PAGES: { key: string; title: string; body: string }[] = [
  {
    key: "mission",
    title: "Our Mission",
    body: "<p>To unify Workers Cooperatives for a Better World through Cooperation, Collaboration, Advocacy, Peer Review, Training, Savings and Investments.</p>",
  },
  {
    key: "vision",
    title: "Our Vision",
    body: "<p>A Nigeria where every federal worker belongs to a strong, well-governed cooperative, and where those cooperatives are united as one federation that builds lasting prosperity for members and the nation.</p>",
  },
  {
    key: "values",
    title: "Our Values",
    body: [
      "<ul>",
      "<li><strong>Self-help.</strong> Members build their own prosperity by saving and investing together.</li>",
      "<li><strong>Democracy.</strong> Every member society has a voice in how the federation is run.</li>",
      "<li><strong>Equity.</strong> Societies large and small are served on the same terms.</li>",
      "<li><strong>Solidarity.</strong> Stronger societies support those still finding their feet.</li>",
      "<li><strong>Transparency.</strong> Accounts, decisions and figures are open to members.</li>",
      "<li><strong>Accountability.</strong> Committees answer to members, and the federation answers to its General Meeting.</li>",
      "</ul>",
    ].join(""),
  },
  {
    key: "about",
    title: "Who we are",
    body: [
      "<p>Almost every federal MDA has a staff cooperative society. Civil servants save through it, borrow from it, and use it to buy homes, vehicles and household goods at fair terms. On their own, these societies are strong inside their agency and invisible outside it.</p>",
      "<p>FEDCOOP brings them together as one federation. It sets shared standards, trains management committees, organises peer review, represents cooperators to government and regulators, and pools the strength of member societies for partnerships and investment.</p>",
      "<p>Member societies include the staff cooperatives of agencies such as NFVCB, CBN, ICPC, NTA, NBC, EFCC, NCC, NNPC, FMAFS and FMTI, drawn from all 36 states and the FCT.</p>",
    ].join(""),
  },
  {
    key: "privacy",
    title: "Privacy notice",
    body: [
      "<p><em>Draft pending review by FEDCOOP.</em></p>",
      "<h2>Who we are</h2>",
      `<p>${LEGAL_NAME}, ${ADDRESS}. Contact: ${EMAIL}.</p>`,
      "<h2>What we collect</h2>",
      "<p>When you send an enquiry, register interest in an event or subscribe to updates, we collect the details you enter: your name, email address, phone number, cooperative society, MDA and message.</p>",
      "<h2>Why we collect it</h2>",
      "<p>To reply to your enquiry, plan events, and send updates you asked for. The lawful basis is your consent, given when you send an enquiry or subscribe, in line with the Nigeria Data Protection Act 2023.</p>",
      "<h2>Who we share it with</h2>",
      "<p>We do not sell personal data. It is stored with our database provider (Convex) and emails are sent through our email provider (Resend). Both process data on our instructions only.</p>",
      "<h2>How long we keep it</h2>",
      "<p>Enquiries are kept for up to three years after they are closed. You can unsubscribe from updates at any time.</p>",
      "<h2>Cookies and analytics</h2>",
      "<p>This website does not set advertising or tracking cookies. Visitor statistics are cookieless. Your theme choice is stored in your own browser.</p>",
      "<h2>Your rights</h2>",
      `<p>You can ask to see, correct or delete the personal data we hold about you by emailing ${EMAIL}.</p>`,
    ].join(""),
  },
  {
    key: "terms",
    title: "Terms of use",
    body: [
      "<p><em>Draft pending review by FEDCOOP.</em></p>",
      "<h2>Using this website</h2>",
      "<p>This website gives information about FEDCOOP and its member cooperative societies. You may use and share its content for non-commercial purposes with credit to FEDCOOP.</p>",
      "<h2>Directory and figures</h2>",
      "<p>Directory entries are supplied by member societies. State and national figures are published only after FEDCOOP has verified them, and each shows the date it was last verified. FEDCOOP does not guarantee that third-party information is complete.</p>",
      "<h2>Membership</h2>",
      "<p>Nothing on this website is an offer of membership or investment. Affiliation follows FEDCOOP's review process and the decision of its governing bodies.</p>",
      "<h2>Links</h2>",
      "<p>Links to other websites are provided for convenience. FEDCOOP is not responsible for their content.</p>",
    ].join(""),
  },
];

/* Home page testimonials (§8.8), from the previous site. The society is kept in `name`, as
 * migrateLegacy stores it, until FEDCOOP supplies a named person and role for each quote. */
const TESTIMONIALS: { quote: string; name: string; mda: string }[] = [
  {
    quote: "FEDCOOP unites individual cooperatives across federal MDAs, promoting cooperation, advocacy, peer review, and productive training. Their support encourages members toward greater goals and productive investments. Truly a fatherly role in advancing workers' cooperatives in Nigeria.",
    name: "NFVCB Staff Multi-purpose Co-operative Society",
    mda: "National Film and Video Censors Board",
  },
  {
    quote: "FEDCOOP is presently the leading institution/ Union in the Workers cooperative World ; leading members through cooperation, collaboration, Advocacy, Peer Review, Training and Investment.",
    name: "EFCC Staff Multi-purpose Cooperative Society",
    mda: "Economic and Financial Crimes Commission",
  },
  {
    quote: "Proud to be part of FEDCOOP, a pioneering union empowering workers through cooperation. Their commitment to mutual support and collective progress fuels our growth and bright future. Together, we achieve excellence and unlock our full potential.",
    name: "NPC Staff Multi-purpose Cooperative Society",
    mda: "National Population Commission",
  },
  {
    quote: "Harnessing strength, unity, and liberty, FEDCOOP is a dependable ally that empowers members to break free from financial constraints. Through resilience and collective wisdom, it safeguards members’ interests, ensuring growth and liberation for all involved. Together, we achieve more",
    name: "Nigerian Law School Staff Multipurpose Cooperative Society",
    mda: "Nigerian Law School",
  },
  {
    quote: "FEDCOOP as an umbrella apex body of Cooperative Society played a leading role of fostering unity, creating invaluable opportunities, leveraging on cooperation, mainstreaming interventions, optimizing conflict resolution mechanism and galvanizing supports and collaboration towards members welfare. With FEDCOOP, it is forward ever and backward never",
    name: "ICPC Staff Multi-purpose Cooperative Society",
    mda: "Independent Corrupt Practices and Other Related Offences Commission",
  },
];

/* Insert-only: rows that already exist (e.g. edited in the admin) are left untouched. */
async function insertSiteContent(ctx: MutationCtx) {
  let stats = 0;
  for (const s of SITE_STATS) {
    const existing = await ctx.db
      .query("siteStats")
      .withIndex("by_key", (q) => q.eq("key", s.key))
      .unique();
    if (existing) continue;
    const known = s.value !== undefined;
    await ctx.db.insert("siteStats", {
      key: s.key,
      label: s.label,
      value: s.value,
      verified: known,
      verifiedAt: known ? Date.now() : undefined,
    });
    stats++;
  }

  let pages = 0;
  for (const p of PAGES) {
    const existing = await ctx.db
      .query("pages")
      .withIndex("by_key", (q) => q.eq("key", p.key))
      .unique();
    if (existing) continue;
    await ctx.db.insert("pages", { ...p, updatedAt: Date.now() });
    pages++;
  }

  // Matched on the society name, so a quote edited in the admin is not inserted again.
  let testimonials = 0;
  const existingTestimonials = await ctx.db.query("testimonials").collect();
  for (const [i, t] of TESTIMONIALS.entries()) {
    if (existingTestimonials.some((e) => e.name === t.name)) continue;
    await ctx.db.insert("testimonials", { ...t, role: "", cooperative: "", order: i, isPublished: true });
    testimonials++;
  }

  await ctx.scheduler.runAfter(0, internal.revalidate.tags, { tags: ["siteStats", "pages", "testimonials"] });
  return { stats, pages, testimonials };
}

export const siteContent = internalMutation({
  args: {},
  handler: (ctx) => insertSiteContent(ctx),
});

/* Everything a fresh deployment needs besides the legacy migrations. Idempotent. */
export const production = internalMutation({
  args: {},
  handler: async (ctx) => ({
    states: await insertStates(ctx),
    siteContent: await insertSiteContent(ctx),
    register: await insertRegister(ctx),
  }),
});
