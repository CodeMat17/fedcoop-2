import type { MetadataRoute } from "next";
import { getAlbums, getCooperatives, getEvents, getPosts } from "@/lib/data";
import { PILLARS, SITE } from "@/lib/site";
import { STATES } from "@/lib/states";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [coops, posts, events, albums] = await Promise.all([getCooperatives(), getPosts(), getEvents(), getAlbums()]);
  const u = (path: string) => `${SITE.url}${path}`;
  const staticPaths = [
    "/", "/about", "/directors", "/what-we-do",    "/cooperatives", "/news", "/events", "/gallery", "/resources",
    "/contact", "/privacy", "/terms",
  ];
  return [
    ...staticPaths.map((p) => ({ url: u(p) })),
    ...PILLARS.map((p) => ({ url: u(`/what-we-do/${p.slug}`) })),
    ...STATES.map((s) => ({ url: u(`/cooperatives/state/${s.slug}`) })),
    ...coops.map((c) => ({ url: u(`/cooperatives/${c.slug}`) })),
    ...posts.map((p) => ({ url: u(`/news/${p.slug}`), lastModified: new Date(p.publishedAt) })),
    ...events.map((e) => ({ url: u(`/events/${e.slug}`) })),
    ...albums.map((a) => ({ url: u(`/gallery/${a.slug}`) })),
  ];
}
