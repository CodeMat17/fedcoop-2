"use client";

import { useRef } from "react";
import { useInViewOnce } from "@/lib/use-motion";
import { cn } from "@/lib/ui";

/** Horizontal left offset of the cord inside the centred shell (see `shell` utility). */
const GUTTER_LEFT = "calc(max(0px, (100vw - 1328px) / 2) + 43px)";

/**
 * Desktop gutter cord (§6.1). `braided` is the thicker home-page cord,
 * otherwise a 2px rule with a scroll-bound fill. Hidden below lg.
 * The fill reads `--page-progress` (set by MotionProvider) in CSS.
 */
export function ScrollCord({ braided = false }: { braided?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 z-0 hidden lg:block"
      style={{ left: GUTTER_LEFT, width: 12 }}
    >
      <svg className="h-full w-full" viewBox="0 0 12 1000" preserveAspectRatio="none">
        <line x1="6" y1="0" x2="6" y2="1000" stroke="var(--cord-line)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
        <path
          d="M6 0 L6 1000"
          pathLength={1}
          stroke="var(--cord)"
          strokeWidth={braided ? 4 : 2}
          strokeLinecap="round"
          fill="none"
          vectorEffect="non-scaling-stroke"
          className="cord-fill"
        />
      </svg>
    </div>
  );
}

/** Mobile: 3px progress cord directly under the 64px header. */
export function MobileProgress() {
  return <div aria-hidden="true" className="cord-progress fixed inset-x-0 top-16 z-40 h-[3px] origin-left bg-cord lg:hidden" />;
}

/** A 10px node on the cord for a home section. Place inside a `relative` content column. */
export function CordNode() {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInViewOnce(ref);
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        "absolute top-3 -left-[69px] hidden size-[10px] rounded-full border-2 border-cord transition-colors duration-700 motion-reduce:bg-cord lg:block",
        seen ? "cord-node-lit bg-cord" : "bg-paper",
      )}
    />
  );
}
