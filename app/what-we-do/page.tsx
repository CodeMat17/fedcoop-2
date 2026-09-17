import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/shared/Page";
import { PillarIcon } from "@/components/shared/PillarIcon";
import { PILLARS } from "@/lib/site";
import { cn, link } from "@/lib/ui";

export const metadata: Metadata = {
  title: "What We Do",
  description: "FEDCOOP's six pillars: cooperation, collaboration, advocacy, peer review, training and investment.",
  alternates: { canonical: "/what-we-do" },
};

export default function WhatWeDo() {
  return (
    <>
      <PageHero
        title="What We Do"
        crumbs={[{ label: "What We Do", href: "/what-we-do" }]}
        standfirst="Six pillars of work, each designed to make a staff cooperative society stronger than it could be on its own."
      />
      <ol className="pb-12">
        {PILLARS.map((p, i) => (
          <li key={p.slug} className="section">
            <div className="shell grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
              <div className={cn("aspect-[3/2] w-full overflow-hidden rounded-card border border-cord-line bg-cord-soft", i % 2 === 1 && "lg:order-2")} aria-hidden="true">
                <div className="grid h-full place-items-center">
                  <PillarIcon slug={p.slug} className="size-20 text-cord" />
                </div>
              </div>
              <div>
                <h2 className="t-section">{p.name}</h2>
                <p className="t-lead mt-4 text-ink-muted">{p.standfirst}</p>
                <Link href={`/what-we-do/${p.slug}`} className={cn(link, "mt-6 inline-flex min-h-11 items-center gap-1")}>
                  How {p.name.toLowerCase()} works <ArrowRight className="size-4" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
