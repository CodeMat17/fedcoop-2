import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Images, MapPin } from "lucide-react";
import { AddToCalendar, Countdown, RsvpForm } from "@/components/events/EventTools";
import { CoverHero } from "@/components/shared/CoverHero";
import { JsonLd } from "@/components/shared/JsonLd";
import { PageHero, Rich } from "@/components/shared/Page";
import { getEvent, getEvents, getResources } from "@/lib/data";
import { fmtDate, fmtTime } from "@/lib/format";
import { SITE } from "@/lib/site";
import { btn, link } from "@/lib/ui";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getEvents()).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const e = await getEvent((await params).slug);
  if (!e) return {};
  return { title: e.title, description: e.summary, alternates: { canonical: `/events/${e.slug}` } };
}

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const e = await getEvent((await params).slug);
  if (!e) notFound();
  // Compared at render time; ISR refreshes the page hourly so upcoming/past stays current.
  const renderedAt = new Date().getTime();
  const upcoming = (e.endsAt ?? e.startsAt) >= renderedAt;
  const url = `${SITE.url}/events/${e.slug}`;
  const resources = upcoming ? [] : (await getResources()).filter((r) => r.pillars?.some((p) => e.pillars.includes(p))).slice(0, 5);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: e.title,
          description: e.summary,
          startDate: new Date(e.startsAt).toISOString(),
          endDate: e.endsAt ? new Date(e.endsAt).toISOString() : undefined,
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: { "@type": "Place", name: e.venue, address: { "@type": "PostalAddress", addressLocality: e.city, addressCountry: "NG" } },
          image: e.coverUrl ? [e.coverUrl] : undefined,
          organizer: { "@type": "Organization", name: SITE.legalName, url: SITE.url },
        }}
      />
      <PageHero title={e.title} crumbs={[{ label: "Events", href: "/events" }, { label: e.title, href: `/events/${e.slug}` }]} standfirst={e.summary}>
        <ul className="mt-8 flex flex-wrap gap-3 font-semibold">
          <li className="flex min-h-11 items-center gap-2 rounded-full border border-cord-line bg-paper-raise/70 px-4 text-[0.93rem]">
            <CalendarDays className="size-5 text-cord" strokeWidth={1.5} aria-hidden="true" />
            <time dateTime={new Date(e.startsAt).toISOString()}>
              {fmtDate(e.startsAt)}, {fmtTime(e.startsAt)}
            </time>
          </li>
          <li className="flex min-h-11 items-center gap-2 rounded-full border border-cord-line bg-paper-raise/70 px-4 text-[0.93rem]">
            <MapPin className="size-5 text-cord" strokeWidth={1.5} aria-hidden="true" /> {e.venue}, {e.city}
          </li>
        </ul>
        {upcoming && (
          <div className="mt-8 flex flex-wrap items-end gap-8">
            <Countdown to={e.startsAt} />
            <AddToCalendar title={e.title} start={e.startsAt} end={e.endsAt} location={`${e.venue}, ${e.city}`} description={e.summary} url={url} />
          </div>
        )}
      </PageHero>

      {e.coverUrl && <CoverHero src={e.coverUrl} alt="" />}

      <div className="shell space-y-16 pb-24">
        <Rich html={e.body} />

        {upcoming && e.rsvpEnabled && (
          <section aria-labelledby="rsvp-h" className="max-w-2xl border-t border-cord-line pt-12">
            <p className="eyebrow mb-4">RSVP</p>
            <h2 id="rsvp-h" className="t-section mb-2">Register interest</h2>
            <p className="mb-6 text-ink-muted">Tell FEDCOOP who is coming so the secretariat can plan seating and materials.</p>
            <RsvpForm eventId={e._id} />
          </section>
        )}

        {!upcoming && (e.albumSlug || resources.length > 0) && (
          <section aria-labelledby="after-h" className="border-t border-cord-line pt-12">
            <h2 id="after-h" className="t-section mb-6">From this event</h2>
            {e.albumSlug && (
              <Link href={`/gallery/${e.albumSlug}`} className={btn.secondary}>
                <Images className="size-4" strokeWidth={1.5} /> View the photographs
              </Link>
            )}
            {resources.length > 0 && (
              <ul className="mt-6 space-y-2">
                {resources.map((r) => (
                  <li key={r._id}>
                    <a href={r.fileUrl} className={link} target="_blank" rel="noopener noreferrer">
                      {r.title} ({r.fileType.toUpperCase()})
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </>
  );
}
