import type { Metadata } from "next";
import { EventTabs } from "@/components/events/EventTools";
import { EventCard } from "@/components/shared/Cards";
import { EmptyState, PageHero } from "@/components/shared/Page";
import { getEvents } from "@/lib/data";
import { currentTime } from "@/lib/format";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Events",
  description: "FEDCOOP AGMs, training workshops, peer review sessions and zonal fora.",
  alternates: { canonical: "/events" },
};

export default async function EventsPage() {
  const events = await getEvents();
  const now = currentTime();
  const upcoming = events.filter((e) => (e.endsAt ?? e.startsAt) >= now).sort((a, b) => a.startsAt - b.startsAt);
  const past = events.filter((e) => (e.endsAt ?? e.startsAt) < now).sort((a, b) => b.startsAt - a.startsAt);

  const grid = (list: typeof events, empty: string) =>
    list.length ? (
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((e) => (
          <li key={e._id}><EventCard event={e} /></li>
        ))}
      </ul>
    ) : (
      <EmptyState title={empty} />
    );

  return (
    <>
      <PageHero title="Events" crumbs={[{ label: "Events", href: "/events" }]} standfirst="General meetings, training workshops and fora for member societies. All times are West Africa Time." />
      <div className="shell pb-24">
        <EventTabs upcoming={grid(upcoming, "No upcoming events scheduled.")} past={grid(past, "No past events recorded yet.")} />
      </div>
    </>
  );
}
