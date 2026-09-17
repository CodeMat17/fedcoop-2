"use client";

import { Command } from "cmdk";
import { Dialog } from "@base-ui/react/dialog";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { SearchEntry } from "@/lib/types";

const EVENT = "fedcoop:open-search";
export const openSearch = () => window.dispatchEvent(new Event(EVENT));

let cache: Promise<SearchEntry[]> | null = null;
export function loadSearchIndex(): Promise<SearchEntry[]> {
  cache ??= fetch("/search-index.json")
    .then((r) => (r.ok ? (r.json() as Promise<SearchEntry[]>) : []))
    .catch(() => {
      cache = null;
      return [];
    });
  return cache;
}

/** ⌘K / Ctrl+K palette. The index is a static JSON fetched once, on first open (§13.7). */
export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SearchEntry[]>([]);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) loadSearchIndex().then(setItems);
  }, [open]);

  const groups = Array.from(new Set(items.map((i) => i.type)));

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[70] bg-ink/40" />
        <Dialog.Popup className="fixed top-[12vh] left-1/2 z-[71] w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-card border border-cord-line bg-paper-raise shadow-2xl">
          <Dialog.Title className="sr-only">Search FEDCOOP</Dialog.Title>
          <Command label="Search FEDCOOP" className="flex max-h-[70vh] flex-col">
            <div className="flex items-center gap-2 border-b border-cord-line px-4">
              <Search className="size-5 text-ink-muted" strokeWidth={1.5} />
              <Command.Input
                autoFocus
                placeholder="Search cooperatives, MDAs, states, news and pages"
                className="min-h-14 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-muted"
              />
            </div>
            <Command.List className="overflow-y-auto p-2">
              <Command.Empty className="px-3 py-6 text-center text-ink-muted">
                Nothing matches that search.
              </Command.Empty>
              {groups.map((g) => (
                <Command.Group
                  key={g}
                  heading={g}
                  className="[&_[cmdk-group-heading]]:t-meta [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-ink-muted"
                >
                  {items
                    .filter((i) => i.type === g)
                    .map((i) => (
                      <Command.Item
                        key={`${i.type}-${i.href}-${i.title}`}
                        value={`${i.title} ${i.hint ?? ""} ${i.keywords ?? ""} ${i.href}`}
                        onSelect={() => {
                          setOpen(false);
                          router.push(i.href);
                        }}
                        className="flex min-h-11 cursor-pointer flex-col justify-center rounded-chip px-3 py-2 data-[selected=true]:bg-cord-soft"
                      >
                        <span className="font-bold text-ink">{i.title}</span>
                        {i.hint && <span className="t-meta text-ink-muted">{i.hint}</span>}
                      </Command.Item>
                    ))}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
