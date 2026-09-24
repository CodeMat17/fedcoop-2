"use client";

import { useRef } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import type { NetworkGeometry } from "@/lib/geo";

/*
 * Hero network: Nigeria draws itself, Abuja lights up, links extend outward to
 * every state, nodes illuminate, cooperative markers appear, then the whole
 * network breathes (CSS). Drifts gently with scroll. Loaded on demand by LazyNetworkMap.
 */

const OUTLINE_S = 1.4;
const HUB_AT = 1.2;
const LINKS_AT = 1.6;
const LINK_STEP = 0.05;
const LINK_S = 0.7;

export function NetworkMap({ width, height, outline, borders, hub, nodes, markers }: NetworkGeometry) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 20, mass: 0.4 });
  const y = useTransform(p, [0, 1], [0, -40]);
  const scale = useTransform(p, [0, 1], [1, 0.96]);
  const rotate = useTransform(p, [0, 1], [0, -3]);
  const linkOpacity = useTransform(p, [0, 1], [1, 0.45]);

  const arrive = (order: number) => LINKS_AT + order * LINK_STEP + LINK_S;
  const byState = new Map(nodes.map((n) => [n.code, n.order]));

  const draw = (delay: number, duration: number) =>
    reduced
      ? { initial: false as const }
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { pathLength: { delay, duration, ease: "easeOut" as const }, opacity: { delay, duration: 0.2 } },
        };
  const pop = (delay: number) =>
    reduced
      ? { initial: false as const }
      : {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { delay, type: "spring" as const, stiffness: 260, damping: 18 },
        };

  return (
    <LazyMotion features={domAnimation} strict>
      <div ref={ref} className="network-map relative h-full w-full">
        <m.svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full overflow-visible"
          role="img"
          aria-labelledby="network-title"
          style={reduced ? undefined : { y, scale, rotate }}
        >
          <title id="network-title">
            FEDCOOP network: member cooperatives connected across Nigeria&apos;s 36 states and the FCT, coordinated from
            Abuja.
          </title>
          <defs>
            <radialGradient id="net-glow">
              <stop offset="0%" stopColor="var(--brass)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--brass)" stopOpacity="0" />
            </radialGradient>
            <filter id="net-soft" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
          </defs>

          {/* country */}
          <m.path
            d={outline}
            fill="none"
            stroke="var(--cord)"
            strokeWidth={1.75}
            strokeLinejoin="round"
            {...draw(0, OUTLINE_S)}
          />
          <m.path
            d={borders}
            fill="none"
            stroke="var(--cord)"
            strokeOpacity={0.22}
            strokeWidth={0.75}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: OUTLINE_S * 0.8, duration: 0.8 }}
          />

          {/* links */}
          <m.g style={reduced ? undefined : { opacity: linkOpacity }}>
            {nodes.map((n) => (
              <m.path
                key={n.code}
                d={n.line}
                fill="none"
                stroke="var(--brass)"
                strokeOpacity={0.45}
                strokeWidth={1}
                strokeLinecap="round"
                {...draw(LINKS_AT + n.order * LINK_STEP, LINK_S)}
              />
            ))}
            {/* travelling pulses on every third link */}
            {nodes
              .filter((n) => n.order % 3 === 0)
              .map((n) => (
                <path
                  key={`pulse-${n.code}`}
                  d={n.line}
                  pathLength={100}
                  className="net-pulse"
                  style={{ animationDelay: `${arrive(n.order) + (n.order % 5) * 0.9}s` }}
                />
              ))}
          </m.g>

          {/* cooperative markers */}
          {markers.map((mk, i) => (
            <m.circle
              key={i}
              cx={mk.x}
              cy={mk.y}
              r={1.6}
              fill="var(--cord)"
              className="net-marker"
              style={{ transformOrigin: `${mk.x}px ${mk.y}px`, animationDelay: `${(i % 11) * 0.37}s` }}
              {...pop(arrive(byState.get(mk.state) ?? 0) + 0.25 + (i % 4) * 0.08)}
            />
          ))}

          {/* state nodes */}
          {nodes.map((n) => (
            <m.g key={n.code} {...pop(arrive(n.order))} style={{ transformOrigin: `${n.x}px ${n.y}px` }}>
              <circle cx={n.x} cy={n.y} r={6} fill="var(--brass)" opacity={0.35} filter="url(#net-soft)" />
              <circle
                cx={n.x}
                cy={n.y}
                r={2.75}
                fill="var(--brass)"
                stroke="var(--paper)"
                strokeWidth={1}
                className="net-node"
                style={{ animationDelay: `${(n.order % 7) * 0.5}s` }}
              >
                <title>{n.name}</title>
              </circle>
            </m.g>
          ))}

          {/* Abuja hub */}
          <m.g {...pop(HUB_AT)} style={{ transformOrigin: `${hub.x}px ${hub.y}px` }}>
            <circle cx={hub.x} cy={hub.y} r={34} fill="url(#net-glow)" />
            <circle
              cx={hub.x}
              cy={hub.y}
              r={10}
              fill="none"
              stroke="var(--brass)"
              strokeWidth={1.25}
              className="net-halo"
              style={{ transformOrigin: `${hub.x}px ${hub.y}px` }}
            />
            <circle cx={hub.x} cy={hub.y} r={6} fill="var(--cord)" stroke="var(--brass)" strokeWidth={2} />
          </m.g>
          <m.text
            x={hub.x + 14}
            y={hub.y - 12}
            className="fill-ink text-[11px] font-bold tracking-wide"
            style={{ paintOrder: "stroke", stroke: "var(--paper)", strokeWidth: 4 }}
            initial={reduced ? false : { opacity: 0, x: hub.x + 8 }}
            animate={{ opacity: 1, x: hub.x + 14 }}
            transition={{ delay: HUB_AT + 0.3, duration: 0.5 }}
          >
            ABUJA · SECRETARIAT
          </m.text>
        </m.svg>
      </div>
    </LazyMotion>
  );
}
