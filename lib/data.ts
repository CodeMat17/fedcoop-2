import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import { unstable_cache } from "next/cache";
import type {
  AlbumWithPhotos,
  Album,
  Cooperative,
  Director,
  EventItem,
  Milestone,
  PageContent,
  Partner,
  Post,
  Resource,
  SiteStat,
  StateStat,
  Testimonial,
} from "./types";

/*
 * Server-side reads for statically rendered pages. Results are cached under
 * tags that Convex invalidates after admin writes (§18.2). When no Convex
 * deployment is configured, every read returns its empty value, and pages
 * render their defined empty states — never placeholder numbers.
 */

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

type FnName = `public:${string}`;

async function read<T>(fn: FnName, args: Record<string, unknown>, empty: T, tags: string[]): Promise<T> {
  if (!CONVEX_URL) return empty;
  const [mod, name] = fn.split(":");
  const cached = unstable_cache(
    async () => {
      const client = new ConvexHttpClient(CONVEX_URL);
      return (await client.query(anyApi[mod][name], args)) as T;
    },
    [fn, JSON.stringify(args)],
    { tags, revalidate: 3600 },
  );
  try {
    return await cached();
  } catch (error) {
    console.error(`Convex read failed: ${fn}`, error);
    return empty;
  }
}

export const getCooperatives = () => read<Cooperative[]>("public:cooperatives", {}, [], ["cooperatives"]);
export const getCooperative = (slug: string) =>
  read<Cooperative | null>("public:cooperativeBySlug", { slug }, null, ["cooperatives"]);
export const getStateStats = () => read<StateStat[]>("public:stateStats", {}, [], ["stateStats"]);
export const getSiteStats = () => read<SiteStat[]>("public:siteStats", {}, [], ["siteStats"]);
export const getDirectors = () => read<Director[]>("public:directors", {}, [], ["directors"]);
export const getPosts = () => read<Post[]>("public:posts", {}, [], ["posts"]);
export const getPost = (slug: string) => read<Post | null>("public:postBySlug", { slug }, null, ["posts"]);
export const getEvents = () => read<EventItem[]>("public:events", {}, [], ["events"]);
export const getEvent = (slug: string) =>
  read<EventItem | null>("public:eventBySlug", { slug }, null, ["events"]);
export const getAlbums = () => read<Album[]>("public:albums", {}, [], ["gallery"]);
export const getAlbum = (slug: string) =>
  read<AlbumWithPhotos | null>("public:albumBySlug", { slug }, null, ["gallery"]);
export const getResources = () => read<Resource[]>("public:resources", {}, [], ["resources"]);
export const getTestimonials = () => read<Testimonial[]>("public:testimonials", {}, [], ["testimonials"]);
export const getMilestones = () => read<Milestone[]>("public:milestones", {}, [], ["pages"]);
export const getPartners = () => read<Partner[]>("public:partners", {}, [], ["pages"]);

export async function getPages(keys: string[]): Promise<Record<string, PageContent>> {
  const rows = await read<PageContent[]>("public:pages", { keys }, [], ["pages"]);
  return Object.fromEntries(rows.map((r) => [r.key, r]));
}

export function stat(stats: SiteStat[], key: string): SiteStat | undefined {
  return stats.find((s) => s.key === key);
}
