import { action, internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/*
 * Public form intake: contact enquiries, event RSVPs and newsletter sign-ups.
 * Spam defence: honeypot + minimum fill time (checked here), optional Cloudflare
 * Turnstile (verified when TURNSTILE_SECRET_KEY is set), and a per-email rate limit.
 * Email goes out via Resend from a Convex action, so Vercel does no work (§15.4).
 */

const MIN_FILL_MS = 3000;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

const category = v.union(
  v.literal("membership"),
  v.literal("general"),
  v.literal("partnership"),
  v.literal("training"),
  v.literal("peer-review"),
  v.literal("investment"),
  v.literal("directory"),
  v.literal("other"),
);

const guard = { website: v.string(), startedAt: v.number(), turnstileToken: v.optional(v.string()) };

async function passesGuard(args: { website: string; startedAt: number; turnstileToken?: string }) {
  if (args.website !== "") return false;
  if (Date.now() - args.startedAt < MIN_FILL_MS) return false;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!args.turnstileToken) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: args.turnstileToken }),
  });
  const data = (await res.json()) as { success: boolean };
  return data.success;
}

async function sendEmail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "FEDCOOP <no-reply@fedcoop.ng>";
  if (!key) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text }),
  });
}

/* ---------------------------------- enquiries ---------------------------------- */

export const submitEnquiry = action({
  args: {
    ...guard,
    category,
    fullName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    subject: v.optional(v.string()),
    message: v.string(),
    cooperativeName: v.optional(v.string()),
    mda: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ ok: boolean; reason?: string }> => {
    const { website, startedAt, turnstileToken, ...enquiry } = args;
    if (!(await passesGuard({ website, startedAt, turnstileToken }))) {
      return { ok: false, reason: "verification" };
    }
    const recent = await ctx.runQuery(internal.forms.recentEnquiries, { email: enquiry.email });
    if (recent >= MAX_PER_WINDOW) return { ok: false, reason: "rate" };

    await ctx.runMutation(internal.forms.insertEnquiry, enquiry);
    await ctx.scheduler.runAfter(0, internal.forms.notifyEnquiry, {
      email: enquiry.email,
      fullName: enquiry.fullName,
      category: enquiry.category,
      message: enquiry.message,
    });
    return { ok: true };
  },
});

export const recentEnquiries = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const rows = await ctx.db
      .query("enquiries")
      .withIndex("by_email", (q) => q.eq("email", email).gt("createdAt", Date.now() - WINDOW_MS))
      .collect();
    return rows.length;
  },
});

export const insertEnquiry = internalMutation({
  args: {
    category,
    fullName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    subject: v.optional(v.string()),
    message: v.string(),
    cooperativeName: v.optional(v.string()),
    mda: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("enquiries", { ...args, status: "new", createdAt: Date.now() });
  },
});

export const notifyEnquiry = internalAction({
  args: { email: v.string(), fullName: v.string(), category: v.string(), message: v.string() },
  handler: async (_ctx, a) => {
    const inbox = process.env.ENQUIRY_INBOX ?? "info@fedcoop.ng";
    await sendEmail(
      inbox,
      `New ${a.category} enquiry from ${a.fullName}`,
      `${a.fullName} <${a.email}>\n\n${a.message}`,
    );
    await sendEmail(
      a.email,
      "Enquiry sent to FEDCOOP",
      `Dear ${a.fullName},\n\nFEDCOOP has received your enquiry and will respond within two working days.\n\nFEDCOOP\nFederal Secretariat Complex, Phase 1, Abuja`,
    );
  },
});

/* ------------------------------------ RSVPs ------------------------------------ */

export const submitRsvp = action({
  args: {
    ...guard,
    eventId: v.id("events"),
    name: v.string(),
    cooperative: v.string(),
    email: v.string(),
    phone: v.string(),
    attendees: v.number(),
  },
  handler: async (ctx, args): Promise<{ ok: boolean; reason?: string }> => {
    const { website, startedAt, turnstileToken, ...rsvp } = args;
    if (!(await passesGuard({ website, startedAt, turnstileToken }))) {
      return { ok: false, reason: "verification" };
    }
    const title = await ctx.runMutation(internal.forms.insertRsvp, rsvp);
    if (title === null) return { ok: false, reason: "closed" };
    await sendEmail(
      rsvp.email,
      `Interest registered: ${title}`,
      `Dear ${rsvp.name},\n\nYour interest in "${title}" for ${rsvp.attendees} attendee(s) is registered. FEDCOOP will send joining details before the event.\n\nFEDCOOP`,
    );
    return { ok: true };
  },
});

export const insertRsvp = internalMutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    cooperative: v.string(),
    email: v.string(),
    phone: v.string(),
    attendees: v.number(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event || !event.isPublished || !event.rsvpEnabled) return null;
    const recent = await ctx.db
      .query("rsvps")
      .withIndex("by_email", (q) => q.eq("email", args.email).gt("createdAt", Date.now() - WINDOW_MS))
      .collect();
    if (recent.length >= MAX_PER_WINDOW) return null;
    const attendees = Math.max(1, Math.min(20, Math.round(args.attendees)));
    await ctx.db.insert("rsvps", { ...args, attendees, createdAt: Date.now() });
    return event.title;
  },
});

/* --------------------------------- newsletter ---------------------------------- */

export const subscribe = action({
  args: { ...guard, email: v.string() },
  handler: async (ctx, args): Promise<{ ok: boolean; reason?: string }> => {
    if (!(await passesGuard({ ...args, turnstileToken: args.turnstileToken }))) {
      return { ok: false, reason: "verification" };
    }
    await ctx.runMutation(internal.forms.insertSubscriber, { email: args.email.toLowerCase() });
    return { ok: true };
  },
});

export const insertSubscriber = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const existing = await ctx.db
      .query("subscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!existing) await ctx.db.insert("subscribers", { email, createdAt: Date.now(), confirmed: false });
  },
});
