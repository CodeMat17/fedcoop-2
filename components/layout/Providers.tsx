"use client";

import { ThemeProvider } from "next-themes";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { MotionProvider } from "@/components/motion/MotionProvider";

/* Toasts only follow a form submit, so sonner loads after hydration instead of with the page. */
const Toaster = dynamic(() => import("sonner").then((m) => m.Toaster), { ssr: false });

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem themes={["light", "dark"]} disableTransitionOnChange>
      <MotionProvider>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            className: "!bg-paper-raise !text-ink !border-cord-line !font-sans !rounded-card",
          }}
        />
      </MotionProvider>
    </ThemeProvider>
  );
}
