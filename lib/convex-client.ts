"use client";

type Result = { ok: boolean; reason?: string };

const url = process.env.NEXT_PUBLIC_CONVEX_URL;

/** Calls a public Convex form action directly from the browser — no Vercel function involved.
 *  The Convex client is imported on submit, so it never weighs on page load. */
export async function callForm(name: "submitEnquiry" | "submitRsvp" | "subscribe", args: Record<string, unknown>): Promise<Result> {
  if (!url) return { ok: false, reason: "offline" };
  const [{ ConvexHttpClient }, { anyApi }] = await Promise.all([import("convex/browser"), import("convex/server")]);
  const client = new ConvexHttpClient(url);
  return (await client.action(anyApi.forms[name], args)) as Result;
}

export function formError(reason?: string): string {
  switch (reason) {
    case "rate":
      return "You have sent several messages in the last hour. Try again later, or call FEDCOOP on +234 (0) 916 248 4000.";
    case "verification":
      return "We could not verify this submission. Reload the page and send it again.";
    case "closed":
      return "Registration for this event is closed.";
    case "offline":
      return "The form is not connected yet. Email email@fedcoop.org or call +234 (0) 916 248 4000.";
    default:
      return "The message did not send. Check your connection and try again.";
  }
}
