import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CordNode, ScrollCord } from "@/components/cord/Cord";
import { Magnetic, Reveal } from "@/components/motion/reveal";
import { LazyNetworkMap } from "@/components/home/LazyNetworkMap";
import { Seal } from "@/components/home/Seal";
import { projectNetwork } from "@/lib/geo";
import { Testimonials } from "@/components/home/Testimonials";
import { EventCard, PostCard } from "@/components/shared/Cards";
import { CtaBand, EmptyState, Rich } from "@/components/shared/Page";
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
import { btn, cn } from "@/lib/ui";

export const revalidate = 3600;

export const metadata: Metadata = { alternates: { canonical: "/" } };

const IMPACT = [
  { key: "memberSocieties", label: "member societies", suffix: "+" },
  { key: "membersRepresented", label: "members represented", suffix: "+" },
  { key: "statesCovered", label: "states covered, with the FCT", suffix: "" },
  { key: "pillars", label: "pillars of service", suffix: "" },
] as const;

/** Facts that need no verified figure — they are true by the federation's structure. */
const HERO_FACTS = [
  { value: "36 + FCT", label: "States reached" },
  { value: "Six", label: "Pillars of service" },
  { value: "One", label: "National voice" },
];

const arrowLink =
  "group inline-flex min-h-11 shrink-0 items-center gap-2 font-semibold whitespace-nowrap text-ink transition-colors hover:text-cord";

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
      <section className='relative isolate flex min-h-[88svh] items-center overflow-hidden pt-10 pb-20 md:min-h-[92svh] md:pb-28'>
        <div aria-hidden='true' className='hero-bg absolute inset-0 -z-10' />
        <div className='shell relative grid items-center gap-14 lg:grid-cols-[1.35fr_0.65fr] lg:gap-12'>
          <div>
            <div className='rise'>
              <p className='eyebrow'>Staff cooperatives of Nigeria&apos;s federal MDAs</p>
            </div>
            <div className='rise' style={{ animationDelay: '80ms' }}>
              <h1 className='mt-7 text-[clamp(2.375rem,1.3rem+3.4vw,4rem)] leading-[1.04] font-black tracking-[-0.04em]'>
                <span className='block'>One Federation.</span>
                <span className='block text-cord'>Hundreds of Cooperatives.</span>
                <span className='block'>One Stronger Future.</span>
              </h1>
            </div>
            <div className='rise' style={{ animationDelay: '160ms' }}>
              <p className='t-lead mt-8 max-w-[48ch] text-ink-muted'>
                FEDCOOP is the unifying umbrella body for staff cooperative
                societies across Nigeria&apos;s federal MDAs, bringing savings,
                credit and welfare initiatives together to create greater
                collective impact.
              </p>
            </div>
            <div className='rise' style={{ animationDelay: '240ms' }}>
              <div className='mt-10 flex flex-wrap items-center gap-x-8 gap-y-4'>
                <Magnetic>
                  <Link href='/cooperatives' className={cn(btn.primary, "min-h-12 px-6")}>
                    Find your coop
                  </Link>
                </Magnetic>
                <Link href='/what-we-do' className={arrowLink}>
                  What we do
                  <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' strokeWidth={1.5} />
                </Link>
              </div>
            </div>
         
          </div>
          <div className='rise hidden w-full max-w-[27rem] justify-self-end lg:block' style={{ animationDelay: '150ms' }}>
            <Seal />
          </div>
        </div>
      </section>

      {/* 8.3 Mission and vision — hidden entirely when empty */}
      {(pages.mission || pages.vision) && (
        <section id='mission' className='section'>
          <div className='shell relative'>
            <CordNode />
            <p className='eyebrow'>Our purpose</p>
            <div className='mt-10 grid gap-x-16 gap-y-12 md:grid-cols-2'>
              {[pages.mission, pages.vision].map(
                (p) =>
                  p && (
                    <Reveal key={p.key} className='border-t border-ink/80 pt-6'>
                      <h2 className='t-meta tracking-[0.12em] text-ink-muted uppercase'>{p.title}</h2>
                      <Rich
                        html={p.body}
                        className='mt-5 text-[clamp(1.25rem,1.05rem+0.8vw,1.625rem)] leading-[1.4] font-semibold tracking-[-0.02em] text-ink'
                      />
                    </Reveal>
                  ),
              )}
            </div>
          </div>
        </section>
      )}

      {/* 8.4 Six pillars */}
      <section id='pillars' className='section'>
        <div className='shell relative'>
          <CordNode />
          <div className='grid gap-8 lg:grid-cols-12 lg:items-end'>
            <div className='lg:col-span-7'>
              <p className='eyebrow'>What we do</p>
              <h2 className='t-section mt-5 max-w-[18ch]'>
                Six pillars hold the federation together.
              </h2>
            </div>
            <div className='lg:col-span-5'>
              <p className='max-w-[42ch] text-ink-muted'>
                Every service FEDCOOP offers its member societies rests on one
                of six commitments, from a shared national voice to collective
                investment.
              </p>
              <Link href='/what-we-do' className={cn(arrowLink, "mt-3")}>
                Explore our work
                <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' strokeWidth={1.5} />
              </Link>
            </div>
          </div>
          <ul className='mt-14 grid gap-px overflow-hidden rounded-card border border-cord-line bg-cord-line md:grid-cols-2 lg:grid-cols-3'>
            {PILLARS.map((p) => (
              <li key={p.slug} className='bg-paper'>
                <Link
                  href={`/what-we-do/${p.slug}`}
                  className='group relative flex h-full flex-col p-7 transition-colors duration-300 hover:bg-paper-raise md:p-9'>
                  <span className='flex items-start justify-between'>
                    <span className='grid size-12 place-items-center rounded-full border border-cord-line text-cord transition-colors duration-300 group-hover:border-cord group-hover:bg-cord group-hover:text-paper'>
                      <PillarIcon slug={p.slug} className='size-5' />
                    </span>
                    <ArrowUpRight
                      className='size-5 -translate-x-1 translate-y-1 text-ink-muted opacity-0 transition-all duration-300 group-hover:translate-0 group-hover:text-cord group-hover:opacity-100'
                      strokeWidth={1.5}
                      aria-hidden='true'
                    />
                  </span>
                  <span className='mt-10 text-[1.5rem] leading-tight font-extrabold tracking-[-0.03em] text-ink'>
                    {p.name}
                  </span>
                  <span className='mt-3 text-[0.95rem] leading-relaxed text-ink-muted'>{p.line}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 8.5 National reach — a dark band for rhythm */}
      <section id='reach' className='dark below-fold relative z-10 overflow-hidden bg-paper py-20 text-ink md:py-32'>
        <div aria-hidden='true' className='guilloche absolute inset-0 opacity-[0.035] [mask-image:radial-gradient(70%_70%_at_75%_50%,#000,transparent)]' />
        <div
          aria-hidden='true'
          className='absolute inset-0 bg-[radial-gradient(50%_60%_at_72%_50%,color-mix(in_oklab,var(--cord)_16%,transparent),transparent_70%)]'
        />
        <div className='shell relative grid items-center gap-12 lg:grid-cols-12'>
          <CordNode />
          <div className='lg:col-span-5'>
            <p className='eyebrow'>National reach</p>
            <h2 className='t-section mt-5'>
              FEDCOOP reaches all 36 states and the FCT.
            </h2>
            <p className='mt-6 max-w-[34rem] text-ink-muted'>
              Federal MDAs have staff in every state, and so do their
              cooperatives. The map traces the network of member societies
              linking every state back to the federation.
            </p>
            <Link href='/cooperatives' className={cn(btn.secondary, "mt-10 border-cord-line bg-transparent")}>
              Explore cooperatives
              <ArrowRight className='size-4' strokeWidth={1.5} />
            </Link>
          </div>
          <Reveal className='h-80 sm:h-105 lg:col-span-7 lg:h-130'>
            <LazyNetworkMap {...network} />
          </Reveal>
        </div>
      </section>

      {/* 8.6 Impact numbers */}

      {/* 8.7 News + events */}
      <section id='latest' className='section below-fold border-t-0!'>
        <div className='shell relative grid gap-16 xl:grid-cols-[3fr_2fr]'>
          <CordNode />
          <div>
            <div className='mb-10 flex items-end justify-between gap-4'>
              <div>
                <p className='eyebrow'>From the secretariat</p>
                <h2 className='t-section mt-4'>Latest news</h2>
              </div>
              <Link href='/news' className={arrowLink}>
                All news
                <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' strokeWidth={1.5} />
              </Link>
            </div>
            {latest.length ? (
              <ul className='grid gap-5 md:grid-cols-3 xl:grid-cols-2'>
                {latest.map((p, i) => (
                  <li key={p._id} className={cn(i === 2 && "xl:hidden")}>
                    <PostCard post={p} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title='No news published yet.'>
                Announcements from the secretariat will appear here.
              </EmptyState>
            )}
          </div>
          <div>
            <div className='mb-10 flex items-end justify-between gap-4'>
              <div>
                <p className='eyebrow'>Diary</p>
                <h2 className='t-section mt-4'>Upcoming events</h2>
              </div>
              <Link href='/events' className={arrowLink}>
                All events
                <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' strokeWidth={1.5} />
              </Link>
            </div>
            {upcoming.length ? (
              <ul className='grid gap-5 md:grid-cols-2 xl:grid-cols-1'>
                {upcoming.map((e) => (
                  <li key={e._id}>
                    <EventCard event={e} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title='No upcoming events scheduled.'>
                Past AGMs and workshops are listed on the events page.
              </EmptyState>
            )}
          </div>
        </div>
      </section>

      {/* 8.8 Testimonials */}
      {testimonials.length > 0 && (
        <section id='voices' className='section below-fold py-20! md:py-24!'>
          <div className='shell relative'>
            <CordNode />
            <div className='mb-10 text-center'>
              <h2 className='eyebrow'>What member societies say</h2>
            </div>
            <Testimonials items={testimonials} />
          </div>
        </section>
      )}

      {/* 8.9 Closing CTA */}
      <CtaBand eyebrow="Membership" title="Bring your cooperative into the federation.">
        <Link href={MEMBERSHIP_CTA.href} className={cn(btn.onCord, "min-h-12 px-6")}>
          {MEMBERSHIP_CTA.label}
          <ArrowRight className="size-4" strokeWidth={1.5} />
        </Link>
      </CtaBand>
    </>
  );
}
