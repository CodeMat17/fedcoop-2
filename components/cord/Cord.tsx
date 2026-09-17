"use client";

import { m, useInView, useMotionValue, useTransform, useMotionValueEvent } from "framer-motion";
import { useRef, useState } from "react";
import { usePageScroll } from "@/components/motion/MotionProvider";
import { dur, ease, inView } from "@/lib/motion";

/** Horizontal left offset of the cord inside the centred shell (see `shell` utility). */
const GUTTER_LEFT = "calc(max(0px, (100vw - 1328px) / 2) + 43px)";

/**
 * Desktop gutter cord (§6.1). `braided` is the thicker home-page cord,
 * otherwise a 2px rule with a scroll-bound fill. Hidden below lg.
 */
export function ScrollCord({ braided = false }: { braided?: boolean }) {
  const { drawn, reduced } = usePageScroll();
  const [settled, setSettled] = useState(false);
  const still = useMotionValue(1);
  const width = braided ? 4 : 2;

  useMotionValueEvent(drawn, "change", (v) => {
    if (!settled && v > 0.999) setSettled(true);
  });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 z-0 hidden lg:block"
      style={{ left: GUTTER_LEFT, width: 12, willChange: settled ? undefined : "transform" }}
    >
      <svg className="h-full w-full" viewBox="0 0 12 1000" preserveAspectRatio="none">
        <line x1="6" y1="0" x2="6" y2="1000" stroke="var(--cord-line)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
        <m.path
          d="M6 0 L6 1000"
          stroke="var(--cord)"
          strokeWidth={width}
          strokeLinecap="round"
          fill="none"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: reduced ? still : drawn }}
        />
      </svg>
    </div>
  );
}

/** Mobile: 3px progress cord directly under the 64px header. */
export function MobileProgress() {
  const { drawn, reduced } = usePageScroll();
  const scaleX = useTransform(drawn, (v) => (reduced ? 1 : v));
  return (
    <m.div
      aria-hidden="true"
      className="fixed inset-x-0 top-16 z-40 h-[3px] origin-left bg-cord lg:hidden"
      style={{ scaleX }}
    />
  );
}

/** A 10px node on the cord for a home section. Place inside a `relative` content column. */
export function CordNode() {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, inView);
  const { reduced } = usePageScroll();
  return (
    <m.span
      ref={ref}
      aria-hidden="true"
      className="absolute top-3 -left-[69px] hidden size-[10px] rounded-full border-2 border-cord lg:block"
      initial={false}
      animate={
        reduced
          ? { backgroundColor: "var(--cord)" }
          : seen
            ? { scale: [1, 1.35, 1], backgroundColor: "var(--cord)" }
            : { scale: 1, backgroundColor: "var(--paper)" }
      }
      transition={{ duration: dur.slow, ease: ease.out }}
    />
  );
}
