"use client";

import { useClerk } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { AuthFrame } from "@/components/admin/AuthFrame";

/** Visiting /admin/sign-out ends the Clerk session, whatever state the browser is in. */
export default function AdminSignOut() {
  const { loaded, signOut } = useClerk();
  useEffect(() => {
    if (loaded) void signOut({ redirectUrl: "/admin/sign-in" });
  }, [loaded, signOut]);
  return (
    <AuthFrame>
      <span className="inline-flex items-center gap-2 text-ink-muted" role="status">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Signing out…
      </span>
    </AuthFrame>
  );
}
