import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, FileDown } from "lucide-react";
import { SelfCheck } from "@/components/pillars/SelfCheck";
import { EventCard, PostCard } from "@/components/shared/Cards";
import { CtaBand, PageHero, Section } from "@/components/shared/Page";
import { PillarIcon } from "@/components/shared/PillarIcon";
import { getEvents, getPosts, getResources } from "@/lib/data";
import { fmtBytes } from "@/lib/format";
import { PILLARS, pillarBySlug } from "@/lib/site";
import { btn, card, cn } from "@/lib/ui";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return PILLARS.map((p) => ({ pillar: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/what-we-do/[pillar]">): Promise<Metadata> {
  const p = pillarBySlug((await params).pillar);
  if (!p) return {};
  return { title: p.name, description: p.standfirst, alternates: { canonical: `/what-we-do/${p.slug}` } };
}

export default async function PillarPage({ params }: PageProps<"/what-we-do/[pillar]">) {
  const pillar = pillarBySlug((await params).pillar);
  if (!pillar) notFound();

  const [posts, events, resources] = await Promise.all([getPosts(), getEvents(), getResources()]);
  const relPosts = posts.filter((p) => p.pillars.includes(pillar.slug)).slice(0, 3);
  const relEvents = events.filter((e) => e.pillars.includes(pillar.slug)).sort((a, b) => b.startsAt - a.startsAt).slice(0, 3);
  const relResources = resources.filter((r) => r.pillars?.includes(pillar.slug)).slice(0, 6);
  const hasEvidence = relPosts.length + relEvents.length + relResources.length > 0;
  const ctaHref = `/contact?category=${pillar.cta.category}`;

  return (
    <>
      <PageHero title={pillar.name} crumbs={[{ label: "What We Do", href: "/what-we-do" }, { label: pillar.name, href: `/what-we-do/${pillar.slug}` }]} standfirst={pillar.standfirst}>
        <span aria-hidden="true" className="absolute top-1/2 right-10 hidden size-40 -translate-y-1/2 place-items-center rounded-full border border-cord-line bg-paper-raise/70 text-cord shadow-[0_30px_60px_-30px_color-mix(in_oklab,var(--cord)_55%,transparent)] backdrop-blur lg:grid xl:size-48">
          <span className="absolute inset-3 rounded-full border border-dashed border-brass/40" />
          <PillarIcon slug={pillar.slug} className="size-14 xl:size-16" />
        </span>
      </PageHero>


      <Section id="practice" eyebrow="In practice" title="What this means in practice">
        <ul className="grid gap-px overflow-hidden rounded-card border border-cord-line bg-cord-line md:grid-cols-2">
          {pillar.practice.map((item) => (
            <li key={item} className="flex gap-4 bg-paper p-6 md:p-8">
              <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-cord-soft text-cord">
                <Check className="size-4" strokeWidth={2} />
              </span>
              <span className="pt-0.5 text-[1.02rem] leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="how" eyebrow="The mechanics" title="How it works">
        <div className="grid max-w-5xl gap-8 md:grid-cols-2 md:gap-12">
          {pillar.how.map((para) => (
            <p key={para} className="border-t border-ink/80 pt-6 text-[1.05rem] leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      </Section>

      {pillar.slug === "peer-review" && (
        <Section id="self-check" title="Governance self-check" intro="Ten questions about your society's governance. Answer honestly; the result stays on this page.">
          <div className="max-w-4xl">
            <SelfCheck />
          </div>
        </Section>
      )}

      {hasEvidence && (
        <Section id="evidence" eyebrow="Evidence" title="In the federation">
          <div className="space-y-12">
            {relPosts.length > 0 && (
              <div>
                <h3 className="t-card mb-4">News</h3>
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {relPosts.map((p) => <li key={p._id}><PostCard post={p} /></li>)}
                </ul>
              </div>
            )}
            {relEvents.length > 0 && (
              <div>
                <h3 className="t-card mb-4">Events</h3>
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {relEvents.map((e) => <li key={e._id}><EventCard event={e} /></li>)}
                </ul>
              </div>
            )}
            {relResources.length > 0 && (
              <div>
                <h3 className="t-card mb-4">Resources</h3>
                <ul className="max-w-3xl border-t border-cord-line">
                  {relResources.map((r) => (
                    <li key={r._id} className="border-b border-cord-line">
                      <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-between gap-4 py-3 hover:text-cord">
                        <span className="inline-flex items-center gap-2 font-bold">
                          <FileDown className="size-4" strokeWidth={1.5} aria-hidden="true" /> {r.title}
                        </span>
                        <span className="t-meta tabular text-ink-muted">{r.fileType.toUpperCase()} · {fmtBytes(r.fileSize)}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}

      <CtaBand eyebrow={pillar.name} title={pillar.line}>
        <Link href={ctaHref} className={cn(btn.onCord, "min-h-12 px-6")}>
          {pillar.cta.label}
          <ArrowRight className="size-4" strokeWidth={1.5} />
        </Link>
      </CtaBand>

      <nav aria-label="Other pillars" className="shell py-16 md:py-20">
        <p className="eyebrow mb-6">Other pillars</p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PILLARS.filter((p) => p.slug !== pillar.slug).map((p) => (
            <li key={p.slug}>
              <Link
                href={`/what-we-do/${p.slug}`}
                className={cn(card, "group flex min-h-16 items-center gap-3 px-5 py-4 hover:border-cord/50")}
              >
                <PillarIcon slug={p.slug} className="size-5 shrink-0 text-cord" />
                <span className="font-semibold group-hover:text-cord">{p.name}</span>
                <ArrowRight className="ml-auto size-4 text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-cord" strokeWidth={1.5} />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
