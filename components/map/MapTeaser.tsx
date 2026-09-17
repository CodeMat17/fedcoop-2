import { BAND_FILLS, bandFor, makeBands } from "@/lib/bands";
import { projectStates } from "@/lib/geo";
import type { StateStat } from "@/lib/types";

/** Static, non-interactive miniature for the home page. Server-rendered SVG, no map bundle (§8.5). */
export function MapTeaser({ stats }: { stats: StateStat[] }) {
  const shapes = projectStates(560, 448);
  const byCode = new Map(stats.map((s) => [s.stateCode, s]));
  const bands = makeBands(stats.map((s) => s.cooperativeCount));
  const top = [...stats].sort((a, b) => b.cooperativeCount - a.cooperativeCount).slice(0, 3);

  return (
    <svg viewBox="0 0 560 448" className="h-auto w-full" role="img" aria-labelledby="teaser-title">
      <title id="teaser-title">
        {top.length
          ? `Map of Nigeria. States with the most verified cooperatives: ${top.map((t) => `${t.stateName} ${t.cooperativeCount}`).join(", ")}.`
          : "Map of Nigeria's 36 states and the FCT. Verified state figures are not yet published."}
      </title>
      <defs>
        <pattern id="hatch-teaser" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="var(--paper-raise)" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--cord-line)" strokeWidth="2" />
        </pattern>
      </defs>
      {shapes.map((s) => {
        const stat = byCode.get(s.code);
        const fill = stat ? BAND_FILLS[bandFor(stat.cooperativeCount, bands)] : "url(#hatch-teaser)";
        return <path key={s.code} d={s.d} fill={fill} stroke="var(--paper)" strokeWidth={1} />;
      })}
      {top.map((t) => {
        const s = shapes.find((x) => x.code === t.stateCode);
        if (!s) return null;
        return (
          <g key={t.stateCode} transform={`translate(${s.cx} ${s.cy})`}>
            <circle r="4" fill="var(--ink)" />
            <text x="8" y="4" className="fill-ink text-[13px] font-extrabold" style={{ paintOrder: "stroke", stroke: "var(--paper)", strokeWidth: 4 }}>
              {t.stateName} · {t.cooperativeCount}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
