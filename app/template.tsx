"use client";

import { useEffect, useState, type ReactNode } from "react";

const session = { renders: 0 };

/** 240ms opacity + 8px y on client navigations only, so the first paint is never delayed (§6.3). CSS; see `.page-enter`. */
export default function Template({ children }: { children: ReactNode }) {
  const [isNavigation] = useState(() => session.renders > 0);

  useEffect(() => {
    session.renders += 1;
  }, []);

  return <div className={isNavigation ? "page-enter" : undefined}>{children}</div>;
}
