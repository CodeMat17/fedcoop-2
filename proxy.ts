import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs on every request, so it does two cheap things only (§18.10):
 * security headers, and an optimistic session-cookie check for /admin.
 * Real authorisation happens inside Convex.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/sign-in" &&
    !request.cookies.has("__convexAuthJWT")
  ) {
    return NextResponse.redirect(new URL("/admin/sign-in", request.url));
  }

  const response = NextResponse.next();
  const h = response.headers;
  const isDev = process.env.NODE_ENV !== "production";
  h.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://res.cloudinary.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site",
      "frame-src https://www.google.com https://challenges.cloudflare.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  );
  h.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  h.set("X-Content-Type-Options", "nosniff");
  h.set("Referrer-Policy", "strict-origin-when-cross-origin");
  h.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|search-index.json).*)"],
};
