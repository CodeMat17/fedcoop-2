import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, CalendarDays, MapPin } from "lucide-react";
import type { Cooperative, EventItem, Post } from "@/lib/types";
import { fmtDate, fmtDateShort, fmtTime } from "@/lib/format";
import { stateByCode } from "@/lib/states";
import { card, chip, cn } from "@/lib/ui";

function Cover({ src, alt }: { src?: string; alt: string }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-t-card bg-cord-soft">
      {src ? (
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
      ) : (
        <svg aria-hidden="true" viewBox="0 0 160 90" className="absolute inset-0 h-full w-full text-cord/30" preserveAspectRatio="xMidYMid slice">
          <path d="M-10 70C30 40 60 80 90 50s50-30 80-10" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M-10 60C30 30 60 70 90 40s50-30 80-10" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      )}
    </div>
  );
}

export function PostCard({ post }: { post: Post }) {
  return (
    <article className={cn(card, "group relative flex flex-col hover:border-cord")}>
      <Cover src={post.coverUrl} alt={post.coverAlt ?? ""} />
      <div className="flex flex-1 flex-col p-5">
        <time dateTime={new Date(post.publishedAt).toISOString()} className="t-meta text-ink-muted">
          {fmtDate(post.publishedAt)}
        </time>
        <h3 className="t-card mt-2">
          <Link href={`/news/${post.slug}`} className="after:absolute after:inset-0 group-hover:text-cord">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-[0.95rem] text-ink-muted">{post.excerpt}</p>
      </div>
    </article>
  );
}

export function EventCard({ event }: { event: EventItem }) {
  return (
    <article className={cn(card, "group relative flex flex-col hover:border-cord")}>
      <Cover src={event.coverUrl} alt="" />
      <div className="flex flex-1 flex-col p-5">
        <p className="t-meta flex items-center gap-1.5 text-ink-muted">
          <CalendarDays className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
          <time dateTime={new Date(event.startsAt).toISOString()}>
            {fmtDateShort(event.startsAt)}, {fmtTime(event.startsAt)}
          </time>
        </p>
        <h3 className="t-card mt-2">
          <Link href={`/events/${event.slug}`} className="after:absolute after:inset-0 group-hover:text-cord">
            {event.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-[0.95rem] text-ink-muted">{event.summary}</p>
        <p className="t-meta mt-3 flex items-center gap-1.5 text-ink-muted">
          <MapPin className="size-3.5" strokeWidth={1.5} aria-hidden="true" /> {event.venue}, {event.city}
        </p>
      </div>
    </article>
  );
}

function Monogram({ coop, size = 48 }: { coop: Pick<Cooperative, "acronym" | "name" | "logoUrl">; size?: number }) {
  if (coop.logoUrl) {
    return (
      <span className="relative shrink-0 overflow-hidden rounded-card border border-cord-line bg-paper-raise" style={{ width: size, height: size }}>
        <Image src={coop.logoUrl} alt="" fill sizes={`${size}px`} className="object-contain p-1" />
      </span>
    );
  }
  const letters = (coop.acronym ?? coop.name.replace(/\[TEST\]\s*/, "")).slice(0, 3).toUpperCase();
  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-card bg-cord-soft font-black tracking-tight text-cord"
      style={{ width: size, height: size, fontSize: size * 0.3 }}
    >
      {letters}
    </span>
  );
}

export function CoopCard({ coop }: { coop: Cooperative }) {
  const state = stateByCode(coop.stateCode);
  return (
    <article className={cn(card, "group relative flex h-full gap-4 p-5 hover:border-cord")}>
      <Monogram coop={coop} />
      <div className="min-w-0 flex-1">
        <h3 className="t-card">
          <Link href={`/cooperatives/${coop.slug}`} className="after:absolute after:inset-0 group-hover:text-cord">
            {coop.name}
          </Link>
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {coop.acronym && <span className={chip}>{coop.acronym}</span>}
          {coop.isVerified && (
            <span className={cn(chip, "gap-1 border-cord/40 text-cord")}>
              <BadgeCheck className="size-3.5" strokeWidth={1.5} aria-hidden="true" /> Verified
            </span>
          )}
        </div>
        <p className="mt-3 text-[0.93rem] text-ink-muted">{coop.mda}</p>
        <p className="t-meta mt-1 text-ink-muted">
          {[state?.name, coop.membershipBand && `${coop.membershipBand} members`].filter(Boolean).join(" · ")}
        </p>
      </div>
    </article>
  );
}
