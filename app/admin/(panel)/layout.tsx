"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { api } from "@/convex/_generated/api";

/**
 * Role gate. proxy.ts has already required a Clerk session; here Convex says
 * whether that account holds the admin role. Anyone without it is sent to
 * /admin/no-access. Every admin query and mutation re-checks the role on the
 * server, so this gate is for the experience, not the security.
 */
export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const me = useQuery(api.users.me, isAuthenticated ? {} : "skip");

  const allowed = me?.role === "admin";
  const denied = !isLoading && (!isAuthenticated || me === null || (me !== undefined && !allowed));

  useEffect(() => {
    if (denied) router.replace("/admin/no-access");
  }, [denied, router]);

  if (!allowed) {
    return (
      <div className="grid min-h-svh place-items-center text-ink-muted" role="status">
        <span className="inline-flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {denied ? "Redirecting…" : "Checking access…"}
        </span>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
