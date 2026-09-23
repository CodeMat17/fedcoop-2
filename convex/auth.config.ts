import type { AuthConfig } from "convex/server";

/*
 * Clerk issues the session JWT; Convex verifies it against this issuer.
 * Set CLERK_JWT_ISSUER_DOMAIN in the Convex dashboard (Settings → Environment
 * Variables) to the Clerk Frontend API URL, https://useful-cheetah-7732.clerk.accounts.dev in development,
 * https://clerk.fedcoop.org in production.
 * Authentication only — who may do what is decided by `users.role` (convex/access.ts).
 */
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
