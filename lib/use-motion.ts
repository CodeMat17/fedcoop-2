"use client";

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";

/*
 * Framer-free motion hooks for the always-loaded site chrome. framer-motion is kept to the
 * components that load it on demand (the home network map, the contact form, gallery stagger).
 */

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => false);
}

/** True once the element has entered the viewport (by `threshold` of its area); never flips back. */
export function useInViewOnce(
  ref: RefObject<Element | null>,
  { rootMargin = "0px 0px -10% 0px", threshold = 0.25 }: { rootMargin?: string; threshold?: number } = {},
): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, seen, rootMargin, threshold]);
  return seen;
}

/** True once the page has scrolled past `offset` pixels; updates on scroll, rAF-throttled. */
export function useScrolledPast(offset: number): boolean {
  const [past, setPast] = useState(false);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setPast(window.scrollY > offset);
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [offset]);
  return past;
}
