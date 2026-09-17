"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { SearchEntry } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { loadSearchIndex } from "./CommandSearch";

export function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [index, setIndex] = useState<SearchEntry[] | null>(null);

  useEffect(() => {
    loadSearchIndex().then(setIndex);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => router.replace(q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname, { scroll: false }), 250);
    return () => clearTimeout(t);
  }, [q, pathname, router]);

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!index || words.length === 0) return [];
    return index.filter((e) => {
      const hay = `${e.title} ${e.hint ?? ""} ${e.keywords ?? ""}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [index, q]);

  return (
    <div className="max-w-3xl">
      <label className="relative block">
        <span className="sr-only">Search FEDCOOP</span>
        <Search className="absolute top-1/2 left-4 size-6 -translate-y-1/2 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
        <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} autoFocus placeholder="Cooperatives, MDAs, states, news and pages" className="min-h-16 pl-13 text-[1.15rem]" />
      </label>
      <p aria-live="polite" className="mt-6 font-bold">
        {q ? (index ? `${results.length} ${results.length === 1 ? "result" : "results"}` : "Loading the index") : "Type to search."}
      </p>
      <ul className="mt-4 border-t border-cord-line">
        {results.slice(0, 100).map((r) => (
          <li key={`${r.type}-${r.href}-${r.title}`} className="border-b border-cord-line">
            <Link href={r.href} className="flex min-h-14 flex-col justify-center py-3 hover:text-cord">
              <span className="t-meta text-ink-muted">{r.type}</span>
              <span className="font-bold">{r.title}</span>
              {r.hint && <span className="text-[0.93rem] text-ink-muted">{r.hint}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
