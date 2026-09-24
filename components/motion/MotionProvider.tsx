"use client";

import { useEffect, type ReactNode } from "react";

/**
 * One scroll listener for the whole app (§6.2). It publishes page progress (0–1) as the
 * `--page-progress` custom property on <html>, which the cords read in CSS — no animation
 * library on the critical path.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = root.scrollHeight - window.innerHeight;
      root.style.setProperty("--page-progress", String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return children;
}
