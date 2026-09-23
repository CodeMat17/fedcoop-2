"use client";

import Link from "next/link";
import { SignIn, useClerk, useUser } from "@clerk/nextjs";
import { ArrowRight, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { btn, card, cn } from "@/lib/ui";

/**
 * Clerk's <SignIn> silently redirects an already signed-in user, which leaves
 * no way to switch accounts. When a session exists, offer to continue with it
 * or sign out and sign in again instead.
 */
export function SignInPanel() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return (
      <span className="inline-flex items-center gap-2 text-ink-muted" role="status">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Loading…
      </span>
    );
  }

  if (!isSignedIn) return <SignIn path="/admin/sign-in" signUpUrl="/admin/sign-up" fallbackRedirectUrl="/admin" />;

  const email = user.primaryEmailAddress?.emailAddress;
  return (
    <div className={cn(card, "w-full max-w-md p-8")}>
      <h1 className="t-section">You are signed in</h1>
      <p className="mt-3 text-ink-muted">
        {email ? (
          <>
            Signed in as <strong className="text-ink">{email}</strong>.
          </>
        ) : (
          "You already have an active session."
        )}{" "}
        Continue to the admin, or sign out to use a different account.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin" className={btn.primary}>
          Continue to admin <ArrowRight aria-hidden="true" />
        </Link>
        <Button variant="secondary" onClick={() => signOut({ redirectUrl: "/admin/sign-in" })}>
          <LogOut aria-hidden="true" /> Sign out
        </Button>
      </div>
    </div>
  );
}
