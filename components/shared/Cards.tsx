import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarDays, MapPin } from "lucide-react";
import type { Cooperative, EventItem, Post } from "@/lib/types";
import { fmtDate, fmtDateShort, fmtDayMonth, fmtTime } from "@/lib/format";
import { faceCrop } from "@/lib/cloudinary-loader";
import { stateByCode } from "@/lib/states";
import { card, chip, cn } from "@/lib/ui";
import { RegistrationBadge } from "./RegistrationBadge";

function Cover({ src, alt, children }: { src?: string; alt: string; children?: React.ReactNode }) {
  return (
    <div className="relative aspect-video overflow-hidden bg-cord-soft">
      {src ? (
        <Image
          src={faceCrop(src, "16:9")}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <svg aria-hidden="true" viewBox="0 0 160 90" className="absolute inset-0 h-full w-full text-cord/25" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 5 }, (_, i) => (
            <path key={i} d={`M-10 ${56 + i * 6}C30 ${26 + i * 6} 60 ${66 + i * 6} 90 ${36 + i * 6}s50-30 80-10`} stroke="currentColor" strokeWidth={i === 2 ? 1.5 : 0.75} fill="none" />
          ))}
        </svg>
      )}
      {children}
    </div>
  );
}

const lift =
  "group relative flex h-full flex-col overflow-hidden hover:-translate-y-0.5 hover:border-cord/40 hover:shadow-[0_24px_48px_-28px_color-mix(in_oklab,var(--cord)_45%,transparent)]";

function ReadMore({ label }: { label: string }) {
  return (
    <span aria-hidden="true" className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[0.9rem] font-semibold text-cord">
      {label}
      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
    </span>
  );
}

export function PostCard({ post }: { post: Post }) {
  return (
    <article className={cn(card, lift)}>
      <Cover src={post.coverUrl} alt={post.coverAlt ?? ""} />
      <div className="flex flex-1 flex-col p-6">
        <time dateTime={new Date(post.publishedAt).toISOString()} className="t-meta tracking-[0.08em] text-brass-ink uppercase">
          {fmtDate(post.publishedAt)}
        </time>
        <h3 className="t-card mt-3 text-balance">
          <Link href={`/news/${post.slug}`} className="after:absolute after:inset-0 group-hover:text-cord">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-[0.95rem] text-ink-muted">{post.excerpt}</p>
        <ReadMore label="Read article" />
      </div>
    </article>
  );
}

export function EventCard({ event }: { event: EventItem }) {
  const { day, month } = fmtDayMonth(event.startsAt);
  return (
    <article className={cn(card, lift)}>
      <Cover src={event.coverUrl} alt="">
        <span className="absolute top-4 left-4 grid min-w-14 place-items-center rounded-chip bg-paper-raise px-2.5 py-2 text-center shadow-lg">
          <span className="block text-[1.5rem] leading-none font-black tracking-[-0.03em] text-ink tabular-nums">{day}</span>
          <span className="mt-1 block text-[0.65rem] font-bold tracking-[0.14em] text-cord uppercase">{month}</span>
        </span>
      </Cover>
      <div className="flex flex-1 flex-col p-6">
        <p className="t-meta flex items-center gap-1.5 tracking-[0.08em] text-brass-ink uppercase">
          <CalendarDays className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
          <time dateTime={new Date(event.startsAt).toISOString()}>
            {fmtDateShort(event.startsAt)} · {fmtTime(event.startsAt)}
          </time>
        </p>
        <h3 className="t-card mt-3 text-balance">
          <Link href={`/events/${event.slug}`} className="after:absolute after:inset-0 group-hover:text-cord">
            {event.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-[0.95rem] text-ink-muted">{event.summary}</p>
        <p className="t-meta mt-4 flex items-center gap-1.5 font-medium text-ink-muted">
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
    <article
      className={cn(
        card,
        "group relative flex h-full gap-4 p-5",
        coop.isRegistered ? "hover:-translate-y-0.5 hover:border-cord/50 hover:shadow-[0_20px_40px_-28px_color-mix(in_oklab,var(--cord)_45%,transparent)]" : "border-dashed bg-paper hover:border-ink-muted/40 hover:bg-paper-raise",
      )}
    >
      <div className={cn("transition-opacity duration-200", !coop.isRegistered && "opacity-55 group-hover:opacity-90")}>
        <Monogram coop={coop} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className={cn("t-card", !coop.isRegistered && "text-ink-muted/80")}>
          <Link href={`/cooperatives/${coop.slug}`} className="after:absolute after:inset-0 group-hover:text-cord">
            {coop.name}
          </Link>
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <RegistrationBadge registered={coop.isRegistered} />
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
