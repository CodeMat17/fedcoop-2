"use client";

import { LazyMotion, domAnimation, m, animate, useInView, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { dur, ease, inView } from "@/lib/motion";

/* framer-motion lives here, off the shared bundle: only pages that use these load it.
   Reveal and Magnetic are CSS-based, in ./reveal. */

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
    <LazyMotion features={domAnimation} strict>
      <Tag className={className} variants={staggerParent(step)} initial="hidden" whileInView="show" viewport={inView}>
        {children}
      </Tag>
    </LazyMotion>
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
