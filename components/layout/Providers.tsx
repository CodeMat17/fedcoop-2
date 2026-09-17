"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import type { ReactNode } from "react";
import { MotionProvider } from "@/components/motion/MotionProvider";

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
