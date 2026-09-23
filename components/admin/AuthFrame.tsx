import type { ReactNode } from "react";
import { Logo } from "@/components/layout/Brand";

/** Full-height frame for the sign-in, sign-up and no-access screens. */
export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <div className="page-hero relative isolate flex min-h-svh flex-col">
      <div aria-hidden="true" className="page-hero-bg absolute inset-0 -z-10" />
      <header className="shell flex items-center justify-between py-6">
        <Logo size={44} />
        <span className="eyebrow">Admin</span>
      </header>
      <div className="shell flex flex-1 items-center justify-center pb-16">{children}</div>
    </div>
  );
}
