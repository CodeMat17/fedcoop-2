"use client";

import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { ArrowLeft, LogOut, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { btn, card, cn } from "@/lib/ui";

export function NoAccess() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const me = useQuery(api.users.me, isAuthenticated ? {} : "skip");
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <div className={cn(card, "w-full max-w-lg p-8 md:p-10")}>
      <span className="grid size-12 place-items-center rounded-full bg-brass-soft text-brass">
        <ShieldAlert className="size-6" aria-hidden="true" />
      </span>
      <h1 className="t-section mt-6">No access</h1>
      <p className="t-lead mt-3 text-ink-muted">
        This area is for FEDCOOP administrators. Your account does not have the admin role.
      </p>
      {email && (
        <p className="mt-4 text-ink-muted">
          Signed in as <strong className="text-ink">{email}</strong>. If you should have access, ask an existing admin to grant
          it from the Users screen.
        </p>
      )}
      {!isLoading && !isAuthenticated && user && (
        <p className="mt-4 rounded-chip border border-danger/30 bg-danger/5 p-3 text-[0.9rem] text-danger">
          Convex could not verify your Clerk session. Check that CLERK_JWT_ISSUER_DOMAIN is set in the Convex dashboard and that
          the Convex integration is enabled in Clerk.
        </p>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className={btn.primary}>
          <ArrowLeft aria-hidden="true" />
          Back to homepage
        </Link>
        {me?.role === "admin" ? (
          <Link href="/admin" className={btn.secondary}>
            Go to the dashboard
          </Link>
        ) : (
          user && (
            <Button variant="secondary" onClick={() => signOut({ redirectUrl: "/admin/sign-in" })}>
              <LogOut aria-hidden="true" />
              Use another account
            </Button>
          )
        )}
      </div>
    </div>
  );
}
