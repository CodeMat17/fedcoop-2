import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { CtaBand, PageHero } from "@/components/shared/Page";
import { PillarIcon } from "@/components/shared/PillarIcon";
import { MEMBERSHIP_CTA, PILLARS } from "@/lib/site";
import { btn, cn } from "@/lib/ui";

export const metadata: Metadata = {
  title: "What We Do",
  description: "FEDCOOP's six pillars: cooperation, collaboration, advocacy, peer review, training and investment.",
  alternates: { canonical: "/what-we-do" },
};

const RINGS = Array.from({ length: 24 }, (_, i) => i * 15);

/** Decorative pillar plate: the icon at the centre of a guilloche rosette. */
function PillarPlate({ slug, name }: { slug: (typeof PILLARS)[number]["slug"]; name: string }) {
  return (
    <div aria-hidden="true" className="relative aspect-[4/3] w-full overflow-hidden rounded-card border border-cord-line bg-cord-soft">
      <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full text-cord" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="currentColor" strokeOpacity={0.14} strokeWidth={0.7}>
          {RINGS.map((a) => (
            <ellipse key={a} cx={200} cy={150} rx={150} ry={46} transform={`rotate(${a} 200 150)`} />
          ))}
        </g>
        <circle cx={200} cy={150} r={128} fill="none" stroke="var(--brass)" strokeOpacity={0.45} strokeWidth={0.8} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="grid size-28 place-items-center rounded-full bg-paper-raise text-cord shadow-[0_24px_48px_-24px_color-mix(in_oklab,var(--cord)_60%,transparent)] ring-1 ring-cord-line md:size-32">
          <PillarIcon slug={slug} className="size-11 md:size-12" />
        </span>
      </div>
      <span className="absolute bottom-5 left-6 text-[0.7rem] font-bold tracking-[0.18em] text-cord/70 uppercase">{name}</span>
    </div>
  );
}

export default function WhatWeDo() {
  return (
    <>
      <PageHero
        title="What We Do"
        eyebrow="Six pillars of service"
        crumbs={[{ label: "What We Do", href: "/what-we-do" }]}
        standfirst="Six pillars of work, each designed to make a staff cooperative society stronger than it could be on its own."
      />

      <nav aria-label="Pillars" className="shell">
        <ul className="-mx-1 flex flex-wrap gap-2">
          {PILLARS.map((p) => (
            <li key={p.slug}>
              <a
                href={`#${p.slug}`}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-cord-line bg-paper-raise px-4 text-[0.9rem] font-semibold transition-colors hover:border-cord hover:text-cord"
              >
                <PillarIcon slug={p.slug} className="size-4 text-cord" />
                {p.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <ol className="mt-6 pb-8">
        {PILLARS.map((p, i) => (
          <li key={p.slug} id={p.slug} className="section">
            <div className="shell grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
              <Reveal className={cn(i % 2 === 1 && "lg:order-2")}>
                <PillarPlate slug={p.slug} name={p.name} />
              </Reveal>
              <div>
                <p className="eyebrow">Pillar of service</p>
                <h2 className="t-section mt-5">{p.name}</h2>
                <p className="mt-3 font-semibold text-cord">{p.line}</p>
                <p className="t-lead mt-5 text-ink-muted">{p.standfirst}</p>
                <Link href={`/what-we-do/${p.slug}`} className={cn(btn.secondary, "group mt-8")}>
                  How {p.name.toLowerCase()} works
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <CtaBand eyebrow="Membership" title="Put all six pillars behind your society.">
        <Link href={MEMBERSHIP_CTA.href} className={cn(btn.onCord, "min-h-12 px-6")}>
          {MEMBERSHIP_CTA.label}
          <ArrowRight className="size-4" strokeWidth={1.5} />
        </Link>
      </CtaBand>
    </>
  );
}
