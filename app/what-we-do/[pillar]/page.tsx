import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, FileDown } from "lucide-react";
import { SelfCheck } from "@/components/pillars/SelfCheck";
import { EventCard, PostCard } from "@/components/shared/Cards";
import { PageHero, Section } from "@/components/shared/Page";
import { PillarIcon } from "@/components/shared/PillarIcon";
import { getEvents, getPosts, getResources } from "@/lib/data";
import { fmtBytes } from "@/lib/format";
import { PILLARS, pillarBySlug } from "@/lib/site";
import { btn, cn, link } from "@/lib/ui";

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
      <PageHero title={pillar.name} crumbs={[{ label: "What We Do", href: "/what-we-do" }, { label: pillar.name, href: `/what-we-do/${pillar.slug}` }]} standfirst={pillar.standfirst} />

      <div aria-hidden="true" className="relative h-48 w-full overflow-hidden border-y border-cord-line bg-cord-soft md:h-72">
        <svg viewBox="0 0 1440 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" fill="none">
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d={`M-20 ${90 + i * 22} C 360 ${20 + i * 30}, 720 ${260 - i * 25}, 1460 ${120 + i * 12}`} stroke={i === 5 ? "var(--brass)" : "var(--cord)"} strokeOpacity={0.2 + i * 0.1} strokeWidth="2" />
          ))}
        </svg>
        <div className="shell relative grid h-full items-center">
          <PillarIcon slug={pillar.slug} className="size-16 text-cord md:size-24" />
        </div>
      </div>

      <Section id="practice" title="What this means in practice">
        <ul className="grid max-w-4xl gap-x-10 gap-y-4 md:grid-cols-2">
          {pillar.practice.map((item) => (
            <li key={item} className="flex gap-3">
              <Check className="mt-1 size-5 shrink-0 text-cord" strokeWidth={1.5} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="how" title="How it works">
        <div className="max-w-[34rem] space-y-4">
          {pillar.how.map((para) => (
            <p key={para}>{para}</p>
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
        <Section id="evidence" title="In the federation">
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

      <section className="relative z-10 bg-cord py-16 text-paper md:py-24">
        <div className="shell flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <h2 className="t-section max-w-[24ch]">{pillar.line}</h2>
          <Link href={ctaHref} className={cn(btn.onCord, "self-start md:self-auto")}>
            {pillar.cta.label}
          </Link>
        </div>
      </section>

      <nav aria-label="Other pillars" className="shell py-12">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {PILLARS.filter((p) => p.slug !== pillar.slug).map((p) => (
            <li key={p.slug}>
              <Link href={`/what-we-do/${p.slug}`} className={cn(link, "inline-flex min-h-11 items-center")}>{p.name}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
