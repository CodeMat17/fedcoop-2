"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { PostCard } from "@/components/shared/Cards";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PILLARS } from "@/lib/site";
import type { Post } from "@/lib/types";

const ALL = "all";

export function NewsList({ posts }: { posts: Post[] }) {
  const [pillar, setPillar] = useState(ALL);
  const [year, setYear] = useState(ALL);
  const [q, setQ] = useState("");

  const years = useMemo(
    () => Array.from(new Set(posts.map((p) => new Date(p.publishedAt).getFullYear()))).sort((a, b) => b - a),
    [posts],
  );

  const pillarItems = [{ value: ALL, label: "All pillars" }, ...PILLARS.map((p) => ({ value: p.slug, label: p.name }))];
  const yearItems = [{ value: ALL, label: "All years" }, ...years.map((y) => ({ value: String(y), label: String(y) }))];

  const shown = posts.filter(
    (p) =>
      (pillar === ALL || p.pillars.includes(pillar)) &&
      (year === ALL || new Date(p.publishedAt).getFullYear() === Number(year)) &&
      (!q || `${p.title} ${p.excerpt}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-[1fr_12rem_9rem]">
        <label className="relative">
          <span className="sr-only">Search news</span>
          <Search className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
          <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search news" className="pl-10" />
        </label>
        <Select items={pillarItems} value={pillar} onValueChange={(v) => setPillar(v ?? ALL)}>
          <SelectTrigger aria-label="Pillar" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pillarItems.map((p) => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select items={yearItems} value={year} onValueChange={(v) => setYear(v ?? ALL)}>
          <SelectTrigger aria-label="Year" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearItems.map((y) => (
              <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <h2 aria-live="polite" className="mt-6 font-bold">
        {shown.length} {shown.length === 1 ? "article" : "articles"}
      </h2>
      {shown.length ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => (
            <li key={p._id}><PostCard post={p} /></li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-card border border-dashed border-cord-line p-10 text-center text-ink-muted">
          {posts.length ? "No article matches these filters." : "No news published yet."}
        </p>
      )}
    </div>
  );
}
