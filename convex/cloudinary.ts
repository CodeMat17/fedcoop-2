import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalAction } from "./_generated/server";

/*
 * All media lives on Cloudinary; Convex stores only the resulting URL or public ID.
 * The browser uploads straight to Cloudinary with a short-lived signature minted
 * here for admins only, so the API secret never leaves Convex.
 * Requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET
 * in the Convex environment.
 */

export const folder = v.union(
  v.literal("news"),
  v.literal("events"),
  v.literal("gallery"),
  v.literal("directors"),
  v.literal("resources"),
  v.literal("cooperatives"),
);

function config() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new ConvexError("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in Convex.");
  }
  return { cloudName, apiKey, apiSecret };
}

/** Cloudinary's signature: SHA-1 of the sorted params joined with & plus the secret. */
async function sign(params: Record<string, string | number>, secret: string) {
  const payload =
    Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join("&") + secret;
  const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const signUpload = action({
  args: { folder },
  handler: async (ctx, args) => {
    await ctx.runQuery(internal.users.assertAdmin, {});
    const { cloudName, apiKey, apiSecret } = config();
    const params = { folder: `fedcoop/${args.folder}`, timestamp: Math.round(Date.now() / 1000) };
    return { cloudName, apiKey, ...params, signature: await sign(params, apiSecret) };
  },
});

/** Removes an asset once nothing in Convex points at it (scheduled by admin deletes). */
export const destroy = internalAction({
  args: { publicId: v.string(), resourceType: v.optional(v.string()) },
  handler: async (_ctx, { publicId, resourceType = "image" }) => {
    const { cloudName, apiKey, apiSecret } = config();
    const params = { public_id: publicId, timestamp: Math.round(Date.now() / 1000) };
    const body = new URLSearchParams({
      ...Object.fromEntries(Object.entries(params).map(([k, val]) => [k, String(val)])),
      api_key: apiKey,
      signature: await sign(params, apiSecret),
    });
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, { method: "POST", body });
    if (!res.ok) console.error(`Cloudinary destroy failed for ${publicId}: ${res.status} ${await res.text()}`);
  },
});
