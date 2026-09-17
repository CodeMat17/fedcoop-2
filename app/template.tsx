"use client";

import { m, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

const session = { renders: 0 };

/** 240ms opacity + 8px y on client navigations only, so the first paint is never delayed (§6.3). */
export default function Template({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [isNavigation] = useState(() => session.renders > 0);

  useEffect(() => {
    session.renders += 1;
  }, []);

  return (
    <m.div
      initial={isNavigation && !reduced ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </m.div>
  );
}
