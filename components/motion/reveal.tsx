"use client";

import { useRef, type ReactNode, type PointerEvent } from "react";
import { useInViewOnce } from "@/lib/use-motion";
import { cn } from "@/lib/ui";

/** Fades and lifts its children in once they scroll into view. CSS transition; see `.reveal`. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInViewOnce(ref);
  return (
    <div
      ref={ref}
      className={cn("reveal", className)}
      data-shown={seen || undefined}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}

/** 6px pull toward the pointer. Primary CTA only; ignored for touch and reduced motion (§7). */
export function Magnetic({ children }: { children: ReactNode }) {
  const onMove = (e: PointerEvent<HTMLSpanElement>) => {
    if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 6;
    const y = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * 6;
    el.style.transition = "none";
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const reset = (e: PointerEvent<HTMLSpanElement>) => {
    const el = e.currentTarget;
    el.style.transition = "transform 0.2s ease-out";
    el.style.transform = "";
  };

  return (
    <span className="inline-flex" onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </span>
  );
}
