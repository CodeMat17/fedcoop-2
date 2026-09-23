"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Hides the public site chrome (header, footer, search) inside the admin app. */
export function PublicOnly({ children }: { children: ReactNode }) {
  return usePathname()?.startsWith("/admin") ? null : children;
}
