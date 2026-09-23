"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient, useConvexAuth, useMutation } from "convex/react";
import { useEffect, type ReactNode } from "react";
import { api } from "@/convex/_generated/api";

/*
 * The admin is a client-side app talking to Convex directly (§17): no SSR
 * beyond the shell. Clerk supplies the session JWT; Convex checks the role.
 * This client exists only on /admin, so the public bundle never loads it.
 */
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <UserSync />
      {children}
    </ConvexProviderWithClerk>
  );
}

/** Records the Clerk account in Convex so an admin can grant it a role later. */
function UserSync() {
  const { isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const store = useMutation(api.users.store);
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    store({
      email: user.primaryEmailAddress?.emailAddress,
      name: user.fullName ?? undefined,
      imageUrl: user.imageUrl,
    }).catch(() => {});
  }, [isAuthenticated, user, store]);
  return null;
}
