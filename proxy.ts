import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

/**
 * Runs on every request, so it does two cheap things only (§18.10):
 * security headers, and Clerk's session check for /admin. Clerk runs on admin
 * routes only, so public pages pay nothing for it. Role checks (authorisation)
 * happen inside Convex.
 */

const isAuthPage = createRouteMatcher(["/admin/sign-in(.*)", "/admin/sign-up(.*)", "/admin/sign-out"]);

/* Set here, not only via NEXT_PUBLIC_CLERK_SIGN_IN_URL: if that env var is missing, Clerk falls back to /sign-in (a 404). */
const SIGN_IN = "/admin/sign-in";
const SIGN_UP = "/admin/sign-up";

const clerk = clerkMiddleware(
  async (auth, request) => {
    if (!isAuthPage(request)) await auth.protect();
  },
  { signInUrl: SIGN_IN, signUpUrl: SIGN_UP },
);

/** The Clerk Frontend API host is encoded in the publishable key: pk_<env>_<base64(host$)>. */
function clerkOrigin() {
  const encoded = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.split("_")[2];
  if (!encoded) return "";
  try {
    return `https://${atob(encoded).replace(/\$$/, "")}`;
  } catch {
    return "";
  }
}

const CLERK = clerkOrigin();
const isDev = process.env.NODE_ENV !== "production";

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com ${CLERK}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://img.clerk.com",
  "font-src 'self' data:",
  `connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://api.cloudinary.com https://res.cloudinary.com https://clerk-telemetry.com ${CLERK}`,
  "frame-src https://www.google.com https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const response = request.nextUrl.pathname.startsWith("/admin")
    ? ((await clerk(request, event)) ?? NextResponse.next())
    : NextResponse.next();

  const h = response.headers;
  try {
    h.set("Content-Security-Policy", CSP);
    h.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    h.set("X-Content-Type-Options", "nosniff");
    h.set("Referrer-Policy", "strict-origin-when-cross-origin");
    h.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  } catch {
    // Redirect responses can carry immutable headers; they render nothing, so skip.
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|search-index.json).*)"],
};
