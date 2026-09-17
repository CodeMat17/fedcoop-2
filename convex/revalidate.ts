import { internalAction } from "./_generated/server";
import { v } from "convex/values";

/**
 * Called (via ctx.scheduler) by admin mutations after a write so the static
 * pages on Vercel refresh by tag instead of polling (§18.2).
 * Requires SITE_URL and REVALIDATE_SECRET in the Convex environment.
 */
export const tags = internalAction({
  args: { tags: v.array(v.string()) },
  handler: async (_ctx, { tags }) => {
    const site = process.env.SITE_URL;
    const secret = process.env.REVALIDATE_SECRET;
    if (!site || !secret) return;
    await fetch(`${site}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-revalidate-secret": secret },
      body: JSON.stringify({ tags }),
    });
  },
});
