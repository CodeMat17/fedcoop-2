"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Cooperative } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s]/g, "");

function matches(c: Cooperative, q: string) {
  if (!q) return true;
  const hay = norm([c.name, c.acronym ?? "", c.mda, ...c.aliases].join(" "));
  return norm(q).split(/\s+/).every((w) => hay.includes(w));
}

/** A–Z list of member society names, searchable. The search term lives in the URL. */
export function Directory({ coops }: { coops: Cooperative[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const q = params.get("q") ?? "";
  const [term, setTerm] = useState(q);

  // Debounced search, 250ms
  useEffect(() => {
    if (term === q) return;
    const t = setTimeout(() => router.replace(term ? `${pathname}?q=${encodeURIComponent(term)}` : pathname, { scroll: false }), 250);
    return () => clearTimeout(t);
  }, [term, q, pathname, router]);

  const results = useMemo(
    () => coops.filter((c) => matches(c, q)).sort((a, b) => a.name.localeCompare(b.name)),
    [coops, q],
  );

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">Search member societies</span>
        <Search className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
        <Input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search member societies"
          className="pl-10"
        />
      </label>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="font-bold">
          {results.length} member {results.length === 1 ? "society" : "societies"}
        </p>
        {q && (
          <Button type="button" variant="ghost" onClick={() => setTerm("")} className="gap-1 px-3 text-cord">
            <X className="size-4" strokeWidth={1.5} /> Clear search
          </Button>
        )}
      </div>

      {results.length === 0 ? (
        <p className="t-card mt-6 rounded-card border border-dashed border-cord-line px-6 py-12 text-center">
          {coops.length === 0 ? "The directory has no published societies yet." : "No society matches your search."}
        </p>
      ) : (
        <ol className="mt-6 divide-y divide-cord-line border-y border-cord-line">
          {results.map((c) => (
            <li key={c._id}>
              <Link href={`/cooperatives/${c.slug}`} className="block py-3 font-bold hover:text-cord">
                {c.name}
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
