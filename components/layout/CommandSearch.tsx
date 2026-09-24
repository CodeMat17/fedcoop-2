"use client";

import dynamic from "next/dynamic";
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

const CommandPalette = dynamic(() => import("./CommandPalette"), { ssr: false });

/**
 * ⌘K / Ctrl+K palette. Only the shortcut listener ships with the page; the palette (cmdk + dialog)
 * loads on first open, and the index is a static JSON fetched once, on first open (§13.7).
 */
export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [wanted, setWanted] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setWanted(true);
        setOpen((o) => !o);
      }
    };
    const onOpen = () => {
      setWanted(true);
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(EVENT, onOpen);
    };
  }, []);

  return wanted ? <CommandPalette open={open} setOpen={setOpen} /> : null;
}
