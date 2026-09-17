import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

/*
 * One-off: move the legacy `excos` board into `directors`, re-hosting photos on
 * Cloudinary and deleting them from Convex storage (media lives on Cloudinary).
 * Requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in
 * the Convex environment. Run: npx convex run migrations:excosToDirectors
 */

const EXCO_RANK = [
  "President",
  "Vice President",
  "2nd Vice President",
  "Secretary General",
  "Ag. Secretary General",
  "Assistant Secretary General",
  "Treasurer",
  "Assistant Treasurer",
  "Financial Secretary",
  "Auditor",
];

export const listExcos = internalQuery({
  args: {},
  handler: (ctx) => ctx.db.query("excos").collect(),
});

async function sha1Hex(input: string) {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function uploadToCloudinary(file: Blob, publicId: string) {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) throw new Error("Cloudinary env vars are not set in Convex");

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params = { overwrite: "true", public_id: publicId, timestamp };
  const toSign = Object.entries(params).map(([k, val]) => `${k}=${val}`).join("&");
  const form = new FormData();
  form.append("file", file);
  for (const [k, val] of Object.entries(params)) form.append(k, val);
  form.append("api_key", key);
  form.append("signature", await sha1Hex(toSign + secret));

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body: form });
  const json = (await res.json()) as { secure_url?: string; error?: { message: string } };
  if (!res.ok || !json.secure_url) throw new Error(`Cloudinary upload failed: ${json.error?.message ?? res.status}`);
  return json.secure_url;
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const excosToDirectors = internalAction({
  args: {},
  handler: async (ctx): Promise<{ name: string; photoUrl?: string }[]> => {
    const excos: Doc<"excos">[] = await ctx.runQuery(internal.migrations.listExcos, {});
    const rows = [];
    for (const e of excos) {
      let photoUrl: string | undefined;
      if (e.image) {
        const blob = await ctx.storage.get(e.image);
        if (blob) photoUrl = await uploadToCloudinary(blob, `fedcoop/directors/${slugify(e.name)}`);
      }
      const rank = EXCO_RANK.indexOf(e.position);
      rows.push({
        excoId: e._id,
        name: e.name,
        office: e.position,
        cooperative: e.description?.replace(/^Rep[.,]\s*/i, "").replace(/ td$/, " Ltd").trim(),
        bio: e.profile,
        photoUrl,
        isExecutive: rank !== -1,
        order: rank === -1 ? EXCO_RANK.length : rank,
      });
    }
    await ctx.runMutation(internal.migrations.writeDirectors, { rows });
    return rows.map((r) => ({ name: r.name, photoUrl: r.photoUrl }));
  },
});

export const writeDirectors = internalMutation({
  args: {
    rows: v.array(
      v.object({
        excoId: v.id("excos"),
        name: v.string(),
        office: v.string(),
        cooperative: v.optional(v.string()),
        bio: v.optional(v.string()),
        photoUrl: v.optional(v.string()),
        isExecutive: v.boolean(),
        order: v.number(),
      }),
    ),
  },
  handler: async (ctx, { rows }) => {
    for (const { excoId, ...row } of rows) {
      await ctx.db.insert("directors", { ...row, isPublished: true });
      // Sever the Convex-hosted photo once the Cloudinary copy is recorded.
      const exco = await ctx.db.get(excoId);
      if (exco?.image) {
        await ctx.storage.delete(exco.image);
        await ctx.db.patch(excoId, { image: undefined });
      }
    }
  },
});
