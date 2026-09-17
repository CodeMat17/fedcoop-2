"use client";

import { createContext, useContext, type ReactNode } from "react";
import { LazyMotion, domAnimation, useScroll, useSpring, useReducedMotion, type MotionValue } from "framer-motion";

type ScrollCtx = { progress: MotionValue<number>; drawn: MotionValue<number>; reduced: boolean };

const Ctx = createContext<ScrollCtx | null>(null);

/** One useScroll for the whole app, published through context (§6.2). */
export function MotionProvider({ children }: { children: ReactNode }) {
  const { scrollYProgress } = useScroll();
  const drawn = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.001 });
  const reduced = Boolean(useReducedMotion());
  return (
    <LazyMotion features={domAnimation} strict>
      <Ctx.Provider value={{ progress: scrollYProgress, drawn, reduced }}>{children}</Ctx.Provider>
    </LazyMotion>
  );
}

export function usePageScroll(): ScrollCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePageScroll must be used inside MotionProvider");
  return ctx;
}
