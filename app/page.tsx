import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CordNode, ScrollCord } from "@/components/cord/Cord";
import { CountUp, Magnetic, Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { NetworkMap } from "@/components/home/NetworkMap";
import { projectNetwork } from "@/lib/geo";
import { Testimonials } from "@/components/home/Testimonials";
import { EventCard, PostCard } from "@/components/shared/Cards";
import { EmptyState, Rich } from "@/components/shared/Page";
import { PillarIcon } from "@/components/shared/PillarIcon";
import {
  getEvents,
  getPages,
  getPosts,
  getSiteStats,
  getStateStats,
  getTestimonials,
  stat,
} from "@/lib/data";
import { currentTime } from "@/lib/format";
import { MEMBERSHIP_CTA, PILLARS } from "@/lib/site";
import { btn, card, cn, link } from "@/lib/ui";

export const revalidate = 3600;

const IMPACT = [
  { key: "memberSocieties", label: "member societies", suffix: "+" },
  { key: "membersRepresented", label: "members represented", suffix: "+" },
  { key: "statesCovered", label: "states covered, with the FCT", suffix: "" },
  { key: "pillars", label: "pillars of service", suffix: "" },
] as const;

export default async function Home() {
  const [pages, stats, stateStats, posts, events, testimonials] = await Promise.all([
    getPages(["mission", "vision"]),
    getSiteStats(),
    getStateStats(),
    getPosts(),
    getEvents(),
    getTestimonials(),
  ]);

  const now = currentTime();
  const upcoming = events.filter((e) => e.startsAt >= now).sort((a, b) => a.startsAt - b.startsAt).slice(0, 2);
  const latest = posts.slice(0, 3);
  const network = projectNetwork(
    560,
    460,
    Object.fromEntries(stateStats.map((s) => [s.stateCode, s.cooperativeCount])),
  );

  return (
    <>
      <ScrollCord braided />

      {/* 8.1 Hero */}
      <section className="relative isolate flex min-h-[85svh] items-center overflow-hidden pt-28 pb-16 md:min-h-[92svh] md:pb-24">
        <div aria-hidden="true" className="hero-bg absolute inset-0 -z-10" />
        <div className="shell relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
          <Reveal>
            <h1 className="t-display max-w-[20ch] text-[clamp(2.25rem,1.5rem+3vw,4rem)]! leading-[1.02]!">
              One Federation. <br className="hidden md:block" />
              <span className="text-cord">Hundreds of Cooperatives.</span> <br className="hidden md:block" />
              One Stronger Future.
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="t-lead mt-6 max-w-[52ch] text-ink-muted">
              FEDCOOP unites the staff cooperative societies of Nigeria&apos;s federal Ministries, Departments and
              Agencies, so that savings, credit and welfare schemes built by civil servants carry national weight.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-10 flex flex-wrap gap-3">
              <Magnetic>
                <Link href="/cooperatives" className={btn.primary}>
                  Find your co-op
                </Link>
              </Magnetic>
              <Link href="/what-we-do" className={btn.secondary}>
                What we do
              </Link>
            </div>
          </Reveal>
          </div>
          <Reveal delay={0.15} className="flex justify-center lg:justify-end">
            <Image
              src="/logo-2.webp"
              alt="FEDCOOP logo"
              width={520}
              height={520}
              priority
              className="h-auto w-full max-w-70 object-contain drop-shadow-xl sm:max-w-95 lg:max-w-120"
            />
          </Reveal>
        </div>
      </section>

      {/* 8.3 Mission and vision — hidden entirely when empty */}
      {(pages.mission || pages.vision) && (
        <section id="mission" className="section">
          <div className="shell relative grid gap-12 md:grid-cols-2">
            <CordNode />
            {[pages.mission, pages.vision].map(
              (p) =>
                p && (
                  <div key={p.key}>
                    <h2 className="t-section">{p.title}</h2>
                    <Rich html={p.body} className="t-lead mt-5 text-ink-muted" />
                  </div>
                ),
            )}
          </div>
        </section>
      )}

      {/* 8.4 Six pillars */}
      <section id="pillars" className="section">
        <div className="shell relative">
          <CordNode />
          <h2 className="t-section max-w-[22ch]">Six pillars hold the federation together.</h2>
          <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p) => (
              <li key={p.slug}>
                <Link href={`/what-we-do/${p.slug}`} className={cn(card, "flex h-full flex-col gap-4 p-6 hover:border-cord")}>
                  <PillarIcon slug={p.slug} className="size-6 text-cord" />
                  <span className="t-card">{p.name}</span>
                  <span className="text-ink-muted">{p.line}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 8.5 National reach */}
      <section id="reach" className="section below-fold">
        <div className="shell relative grid items-center gap-12 lg:grid-cols-12">
          <CordNode />
          <div className="lg:col-span-5">
            <h2 className="t-section">FEDCOOP reaches all 36 states and the FCT.</h2>
            <p className="mt-5 max-w-[34rem] text-ink-muted">
              Federal MDAs have staff in every state, and so do their cooperatives. The map traces the network of member
              societies linking every state back to the federation.
            </p>
            <Link href="/cooperatives" className={cn(btn.secondary, "mt-8")}>
              Explore Cooperatives <ArrowRight className="size-4" strokeWidth={1.5} />
            </Link>
          </div>
          <Reveal className="h-80 sm:h-105 lg:col-span-7 lg:h-130">
            <NetworkMap {...network} />
          </Reveal>
        </div>
      </section>

      {/* 8.6 Impact numbers */}
    

      {/* 8.7 News + events */}
      <section id="latest" className="section below-fold">
        <div className="shell relative grid gap-14 xl:grid-cols-[3fr_2fr]">
          <CordNode />
          <div>
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 className="t-section">Latest news</h2>
              <Link href="/news" className={link}>
                All news
              </Link>
            </div>
            {latest.length ? (
              <ul className="grid gap-4 md:grid-cols-3 xl:grid-cols-2">
                {latest.map((p, i) => (
                  <li key={p._id} className={cn(i === 2 && "xl:hidden")}>
                    <PostCard post={p} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No news published yet.">Announcements from the secretariat will appear here.</EmptyState>
            )}
          </div>
          <div>
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 className="t-section">Upcoming events</h2>
              <Link href="/events" className={link}>
                All events
              </Link>
            </div>
            {upcoming.length ? (
              <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                {upcoming.map((e) => (
                  <li key={e._id}>
                    <EventCard event={e} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No upcoming events scheduled.">
                Past AGMs and workshops are listed on the events page.
              </EmptyState>
            )}
          </div>
        </div>
      </section>

      {/* 8.8 Testimonials */}
      {testimonials.length > 0 && (
        <section id="voices" className="section below-fold">
          <div className="shell relative">
            <CordNode />
            <h2 className="t-section mb-10">What member societies say.</h2>
            <Testimonials items={testimonials} />
          </div>
        </section>
      )}

      {/* 8.9 Closing CTA */}
      <section className="relative z-10 bg-cord py-20 text-paper md:py-28">
        <div className="shell">
          <h2 className="t-title max-w-[18ch]">Bring your cooperative into the federation.</h2>
          <Link href={MEMBERSHIP_CTA.href} className={cn(btn.onCord, "mt-10")}>
            {MEMBERSHIP_CTA.label}
          </Link>
        </div>
      </section>
    </>
  );
}
