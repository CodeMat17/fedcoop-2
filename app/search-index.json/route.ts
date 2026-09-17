import { getCooperatives, getEvents, getPosts } from "@/lib/data";
import { NAV, NAV_SINGLE, PILLARS } from "@/lib/site";
import { STATES } from "@/lib/states";
import type { SearchEntry } from "@/lib/types";

export const revalidate = 3600;

/** Static search index for the ⌘K palette, rebuilt on revalidation (§13.7). */
export async function GET() {
  const [coops, posts, events] = await Promise.all([getCooperatives(), getPosts(), getEvents()]);

  const pages: SearchEntry[] = [
    { type: "Page", title: "Home", href: "/" },
    ...NAV.flatMap((g) => (g.links ?? [{ label: g.label, href: g.href }] as { label: string; href: string; description?: string }[]).map((l) => ({ type: "Page" as const, title: l.label, hint: l.description, href: l.href }))),
    ...NAV_SINGLE.map((l) => ({ type: "Page" as const, title: l.label, href: l.href })),
  ];

  const mdas = Array.from(new Map(coops.map((c) => [c.mda, c])).values());

  const entries: SearchEntry[] = [
    ...coops.map((c) => ({
      type: "Cooperative" as const,
      title: c.name,
      hint: [c.acronym, c.mda].filter(Boolean).join(" · "),
      href: `/cooperatives/${c.slug}`,
      keywords: c.aliases.join(" "),
    })),
    ...mdas.map((c) => ({
      type: "MDA" as const,
      title: c.mda,
      hint: c.acronym,
      href: `/cooperatives?q=${encodeURIComponent(c.acronym ?? c.mda)}`,
      keywords: c.aliases.join(" "),
    })),
    ...STATES.map((s) => ({ type: "State" as const, title: s.name, href: `/cooperatives/state/${s.slug}` })),
    ...posts.map((p) => ({ type: "News" as const, title: p.title, href: `/news/${p.slug}` })),
    ...events.map((e) => ({ type: "Event" as const, title: e.title, hint: e.city, href: `/events/${e.slug}` })),
    ...pages,
    ...PILLARS.map((p) => ({ type: "Page" as const, title: p.name, hint: p.line, href: `/what-we-do/${p.slug}` })),
  ];

  return Response.json(entries);
}
