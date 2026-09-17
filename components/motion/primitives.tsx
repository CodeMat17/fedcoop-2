"use client";

import {
  m,
  animate,
  useInView,
  useReducedMotion,
  useMotionValue,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type PointerEvent } from "react";
import { dur, ease, inView } from "@/lib/motion";

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={inView}
      transition={{ duration: dur.slow, ease: ease.out, delay }}
    >
      {children}
    </m.div>
  );
}

const staggerParent = (step: number): Variants => ({ hidden: {}, show: { transition: { staggerChildren: step } } });
const staggerChild: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: dur.base, ease: ease.out } },
};

export function Stagger({
  children,
  className,
  step = 0.06,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  step?: number;
  as?: "div" | "ul";
}) {
  const reduced = useReducedMotion();
  const Tag = as === "ul" ? m.ul : m.div;
  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  return (
    <Tag className={className} variants={staggerParent(step)} initial="hidden" whileInView="show" viewport={inView}>
      {children}
    </Tag>
  );
}

export function StaggerItem({
  children,
  className,
  style,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "li";
}) {
  const reduced = useReducedMotion();
  const Tag = as === "li" ? m.li : m.div;
  if (reduced) {
    const Plain = as;
    return (
      <Plain className={className} style={style}>
        {children}
      </Plain>
    );
  }
  return (
    <Tag className={className} style={style} variants={staggerChild}>
      {children}
    </Tag>
  );
}

/** Counts from 0 to a real value. Renders nothing animated when value is null (§7). */
export function CountUp({ value, suffix = "" }: { value: number | null; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const [shown, setShown] = useState<number>(0);

  useEffect(() => {
    if (value === null || !seen || reduced) return;
    const controls = animate(0, value, {
      duration: dur.cinematic,
      ease: ease.out,
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, seen, reduced]);

  if (value === null) return <span className="tabular">—</span>;
  const final = new Intl.NumberFormat("en-NG").format(value);
  return (
    <span ref={ref} className="tabular">
      <span aria-hidden="true">
        {new Intl.NumberFormat("en-NG").format(reduced ? value : seen ? shown : 0)}
        {suffix}
      </span>
      <span className="sr-only">
        {final}
        {suffix}
      </span>
    </span>
  );
}

/** 6px pull toward the pointer. Primary CTA only; ignored for touch (§7). */
export function Magnetic({ children }: { children: ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const reduced = useReducedMotion();

  const onMove = (e: PointerEvent<HTMLSpanElement>) => {
    if (reduced || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set(((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 6);
    y.set(((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * 6);
  };
  const reset = () => {
    animate(x, 0, { duration: dur.fast });
    animate(y, 0, { duration: dur.fast });
  };

  return (
    <m.span className="inline-flex" style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </m.span>
  );
}
