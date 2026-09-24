"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import type { NetworkGeometry } from "@/lib/geo";
import { useInViewOnce } from "@/lib/use-motion";

const NetworkMap = dynamic(() => import("./NetworkMap").then((m) => m.NetworkMap), { ssr: false });

/**
 * The network map (framer-motion and hundreds of animated nodes) loads only as its section
 * nears the viewport, so none of it weighs on the home page's first load.
 */
export function LazyNetworkMap(props: NetworkGeometry) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInViewOnce(ref, { rootMargin: "400px 0px", threshold: 0 });
  return (
    <div ref={ref} className="h-full w-full">
      {near && <NetworkMap {...props} />}
    </div>
  );
}
