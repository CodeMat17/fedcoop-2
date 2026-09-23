"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowRight, Plus } from "lucide-react";
import { Loading, PageHead, Panel, Status } from "@/components/admin/ui";
import { api } from "@/convex/_generated/api";
import { fmtDate, fmtNumber } from "@/lib/format";
import { ENQUIRY_CATEGORIES } from "@/lib/site";
import { btn, card, cn } from "@/lib/ui";

export default function Dashboard() {
  const s = useQuery(api.admin.dashboard.summary);
  if (!s) return <Loading />;

  const tiles = [
    { label: "New enquiries", value: s.enquiries.new, note: `${s.enquiries.inProgress} in progress`, href: "/admin/enquiries" },
    { label: "Articles", value: s.posts.total, note: `${s.posts.drafts} draft${s.posts.drafts === 1 ? "" : "s"}`, href: "/admin/news" },
    { label: "Upcoming events", value: s.events.upcoming, note: `${s.events.total} in total`, href: "/admin/events" },
    { label: "Albums", value: s.albums.total, note: `${s.albums.drafts} draft${s.albums.drafts === 1 ? "" : "s"}`, href: "/admin/gallery" },
    { label: "Cooperatives", value: s.cooperatives.total, note: `${s.cooperatives.published} published`, href: "/admin/cooperatives" },
    { label: "Subscribers", value: s.subscribers, note: "newsletter", href: "/admin/subscribers" },
  ];

  return (
    <>
      <PageHead
        title="Dashboard"
        description="What needs attention across the FEDCOOP website."
        actions={
          <>
            <Link href="/admin/news/new" className={btn.primary}>
              <Plus aria-hidden="true" /> New article
            </Link>
            <Link href="/admin/events/new" className={btn.secondary}>
              <Plus aria-hidden="true" /> New event
            </Link>
          </>
        }
      />

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link href={t.href} className={cn(card, "block h-full p-5 hover:border-cord")}>
              <p className="text-[0.8rem] font-bold tracking-[0.08em] text-ink-muted uppercase">{t.label}</p>
              <p className="mt-2 text-[2rem] leading-none font-black tracking-[-0.03em]">{fmtNumber(t.value)}</p>
              <p className="mt-1.5 text-[0.85rem] text-ink-muted">{t.note}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel
          title="Latest enquiries"
          actions={
            <Link href="/admin/enquiries" className="inline-flex items-center gap-1 text-[0.9rem] font-bold text-cord">
              Inbox <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          }
        >
          {s.recentEnquiries.length === 0 ? (
            <p className="text-ink-muted">No enquiries yet.</p>
          ) : (
            <ul className="divide-y divide-cord-line/70">
              {s.recentEnquiries.map((e) => (
                <li key={e._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{e.fullName}</p>
                    <p className="truncate text-[0.85rem] text-ink-muted">
                      {ENQUIRY_CATEGORIES.find((c) => c.value === e.category)?.label ?? e.category}
                      {e.subject && ` · ${e.subject}`} · {fmtDate(e.createdAt)}
                    </p>
                  </div>
                  <Status on={e.status === "closed"} onLabel="Closed" offLabel={e.status === "new" ? "New" : "In progress"} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Recent articles"
          actions={
            <Link href="/admin/news" className="inline-flex items-center gap-1 text-[0.9rem] font-bold text-cord">
              All news <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          }
        >
          {s.recentPosts.length === 0 ? (
            <p className="text-ink-muted">No articles yet.</p>
          ) : (
            <ul className="divide-y divide-cord-line/70">
              {s.recentPosts.map((p) => (
                <li key={p._id}>
                  <Link href={`/admin/news/${p._id}`} className="flex items-center justify-between gap-3 py-3 hover:text-cord">
                    <div className="min-w-0">
                      <p className="truncate font-bold">{p.title}</p>
                      <p className="text-[0.85rem] text-ink-muted">{fmtDate(p.publishedAt)}</p>
                    </div>
                    <Status on={p.isPublished} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
