import Image from "next/image";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/ui";

const C = 240;
const TEXT_R = 208;
const PETALS = Array.from({ length: 36 }, (_, i) => i * 10);

/**
 * Institutional seal: the badge set inside a guilloche rosette, ringed by the
 * union's legal name. Pure SVG + one image, so it renders on the server.
 */
export function Seal({ className }: { className?: string }) {
  const ring = `M ${C} ${C - TEXT_R} a ${TEXT_R} ${TEXT_R} 0 1 1 0 ${TEXT_R * 2} a ${TEXT_R} ${TEXT_R} 0 1 1 0 ${-TEXT_R * 2}`;
  return (
    <div className={cn("relative aspect-square w-full", className)}>
      <div
        aria-hidden="true"
        className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--brass)_22%,transparent),transparent_70%)] blur-2xl"
      />
      <svg viewBox="0 0 480 480" aria-hidden="true" className="relative h-full w-full text-cord">
        <defs>
          <path id="seal-ring" d={ring} />
        </defs>

        <circle cx={C} cy={C} r={236} fill="none" stroke="currentColor" strokeOpacity={0.35} strokeWidth={0.75} />
        <circle cx={C} cy={C} r={228} fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth={0.75} />
        <circle cx={C} cy={C} r={188} fill="none" stroke="var(--brass)" strokeOpacity={0.55} strokeWidth={0.75} />
        <circle cx={C} cy={C} r={182} fill="none" stroke="currentColor" strokeOpacity={0.18} strokeWidth={0.75} strokeDasharray="1 5" />

        <g fill="none" stroke="currentColor" strokeOpacity={0.14} strokeWidth={0.6}>
          {PETALS.map((a) => (
            <ellipse key={a} cx={C} cy={C} rx={176} ry={58} transform={`rotate(${a} ${C} ${C})`} />
          ))}
        </g>

        <g className="seal-ring">
          <text
            fill="currentColor"
            fillOpacity={0.75}
            fontSize={12.5}
            fontWeight={600}
            letterSpacing="0.2em"
            style={{ textTransform: "uppercase" }}
          >
            <textPath href="#seal-ring" textLength={2 * Math.PI * TEXT_R - 24} lengthAdjust="spacing">
              {SITE.legalName} ·
            </textPath>
          </text>
        </g>
      </svg>

      <div className="absolute inset-[27%] overflow-hidden rounded-full bg-paper-raise shadow-[0_30px_60px_-30px_rgb(14_77_60/0.55),0_0_0_1px_var(--cord-line)]">
        <Image
          src="/logo-2.webp"
          alt="FEDCOOP seal"
          fill
          priority
          sizes="(min-width: 1024px) 240px, 50vw"
          className="object-contain p-[6%]"
        />
      </div>
    </div>
  );
}
