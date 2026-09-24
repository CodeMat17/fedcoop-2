"use client";

import { ChevronRight, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Cooperative } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RegistrationBadge } from "@/components/shared/RegistrationBadge";
import { cn } from "@/lib/ui";

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s]/g, "");

function matches(c: Cooperative, q: string) {
  if (!q) return true;
  const hay = norm([c.name, c.acronym ?? "", c.mda, ...c.aliases].join(" "));
  return norm(q).split(/\s+/).every((w) => hay.includes(w));
}

const FILTERS = [
  { value: "all", label: "All" },
  { value: "registered", label: "Registered" },
  { value: "unregistered", label: "Not registered" },
] as const;
type Filter = (typeof FILTERS)[number]["value"];

const inFilter = (c: Cooperative, f: Filter) =>
  f === "all" || (f === "registered" ? !!c.isRegistered : !c.isRegistered);

/** A–Z list of member society names, searchable and filterable by registration. Both live in the URL. */
export function Directory({ coops }: { coops: Cooperative[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const q = params.get("q") ?? "";
  const status: Filter = FILTERS.find((f) => f.value === params.get("status"))?.value ?? "all";
  const [term, setTerm] = useState(q);

  const go = (next: { q?: string; status?: Filter }) => {
    const sp = new URLSearchParams();
    const nq = next.q ?? q;
    const ns = next.status ?? status;
    if (nq) sp.set("q", nq);
    if (ns !== "all") sp.set("status", ns);
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Debounced search, 250ms
  useEffect(() => {
    if (term === q) return;
    const t = setTimeout(() => go({ q: term }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, q]);

  const searched = useMemo(
    () => coops.filter((c) => matches(c, q)).sort((a, b) => a.name.localeCompare(b.name)),
    [coops, q],
  );
  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f.value, searched.filter((c) => inFilter(c, f.value)).length])) as Record<Filter, number>,
    [searched],
  );
  const results = useMemo(() => searched.filter((c) => inFilter(c, status)), [searched, status]);

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">Search member societies</span>
        <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
        <Input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search by society, acronym or MDA"
          className="min-h-14 rounded-full bg-paper-raise pl-12 text-[1.02rem] shadow-[0_12px_30px_-24px_rgb(16_26_23/0.4)]"
        />
      </label>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div role="radiogroup" aria-label="Filter by registration" className="inline-flex max-w-full overflow-x-auto rounded-full border border-cord-line bg-paper-raise p-1">
          {FILTERS.map((f) => {
            const active = status === f.value;
            return (
              <button
                key={f.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => go({ status: f.value })}
                className={cn(
                  "inline-flex min-h-9 items-center gap-2 rounded-full px-3.5 t-meta whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  active ? "bg-cord text-paper shadow-sm" : "text-ink-muted hover:bg-cord-soft hover:text-ink",
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[0.72rem] tabular-nums",
                    active ? "bg-paper/20 text-paper" : "bg-cord-soft text-ink-muted",
                  )}
                >
                  {counts[f.value]}
                </span>
              </button>
            );
          })}
        </div>
        {q && (
          <Button type="button" variant="ghost" onClick={() => setTerm("")} className="gap-1 px-3 text-cord">
            <X className="size-4" strokeWidth={1.5} /> Clear search
          </Button>
        )}
      </div>

      <p aria-live="polite" className="mt-6 font-bold">
        {results.length} member {results.length === 1 ? "society" : "societies"}
      </p>

      {results.length === 0 ? (
        <p className="t-card mt-4 rounded-card border border-dashed border-cord-line px-6 py-12 text-center">
          {coops.length === 0
            ? "The directory has no published societies yet."
            : searched.length > 0
              ? `No ${status === "registered" ? "registered" : "unregistered"} society matches your search.`
              : "No society matches your search."}
        </p>
      ) : (
        <ol className="mt-4 divide-y divide-cord-line border-y border-cord-line">
          {results.map((c) => (
            <li key={c._id}>
              <Link
                href={`/cooperatives/${c.slug}`}
                className={cn(
                  "group -mx-3 flex items-center gap-3 rounded-chip px-3 py-3.5 transition-colors duration-200",
                  c.isRegistered ? "hover:bg-cord-soft/60" : "hover:bg-cord-soft/35",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn("size-1.5 shrink-0 rounded-full", c.isRegistered ? "bg-cord" : "bg-ink-muted/30")}
                />
                <span
                  className={cn(
                    "min-w-0 flex-1 transition-colors duration-200",
                    c.isRegistered ? "font-bold text-ink group-hover:text-cord" : "font-semibold text-ink-muted group-hover:text-ink",
                  )}
                >
                  {c.name}
                </span>
                <RegistrationBadge registered={c.isRegistered} />
                <ChevronRight
                  className="size-4 shrink-0 -translate-x-1 text-ink-muted opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 max-sm:hidden"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
