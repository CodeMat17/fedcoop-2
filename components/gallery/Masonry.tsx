"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import type { Photo } from "@/lib/types";
import { cn } from "@/lib/ui";

const Lightbox = dynamic(() => import("./Lightbox"), { ssr: false });

const GALLERY_CATEGORIES = ["AGM", "Training", "Peer Review", "Advocacy", "Investment", "Partnerships", "Community"];

const ROW = 8; // grid-auto-rows: 8px (§14.2)

const noop = () => () => {};
const readPhotoParam = () => new URLSearchParams(window.location.search).get("photo");

/**
 * CSS-grid masonry. Each tile keeps its own aspect ratio (object-fit: contain) and
 * spans enough 8px rows to fit its measured height. Upgrades to native masonry where supported.
 */
export function Masonry({ photos, albumTitle }: { photos: Photo[]; albumTitle: string }) {
  const [filter, setFilter] = useState("");
  // undefined = the visitor has not opened or closed anything yet, so a ?photo= deep link applies
  const [chosen, setChosen] = useState<number | null | undefined>(undefined);
  const tileRefs = useRef(new Map<string, HTMLButtonElement>());
  const [returnTo, setReturnTo] = useState<HTMLButtonElement | null>(null);
  const ready = useSyncExternalStore(noop, () => true, () => false);
  const deepLinkId = useSyncExternalStore(noop, readPhotoParam, () => null);

  const categories = GALLERY_CATEGORIES.filter((c) => photos.some((p) => p.category === c));
  const shown = filter ? photos.filter((p) => p.category === filter) : photos;

  const deepIndex = deepLinkId ? shown.findIndex((p) => p._id === deepLinkId) : -1;
  const openIndex = chosen !== undefined ? chosen : deepIndex >= 0 ? deepIndex : null;
  const setOpenIndex = setChosen;

  const open = (photo: Photo) => {
    const i = shown.findIndex((p) => p._id === photo._id);
    setReturnTo(tileRefs.current.get(photo._id) ?? null);
    setOpenIndex(i);
  };

  const syncUrl = useCallback((photo: Photo | null) => {
    const url = new URL(window.location.href);
    if (photo) url.searchParams.set("photo", photo._id);
    else url.searchParams.delete("photo");
    window.history.replaceState(null, "", url);
  }, []);

  return (
    <div>
      {categories.length > 1 && (
        <div role="group" aria-label="Filter by category" className="mb-8 flex flex-wrap gap-2">
          {["", ...categories].map((c) => (
            <Button
              key={c || "all"}
              type="button"
              variant="bare"
              size="none"
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
              className={cn(
                "min-h-11 rounded-chip border px-4 font-bold",
                filter === c ? "border-cord bg-cord text-paper" : "border-cord-line hover:border-cord",
              )}
            >
              {c || "All"}
            </Button>
          ))}
        </div>
      )}

      {/* 8px auto-rows only once tiles can be measured; before hydration the grid flows normally */}
      <Stagger
        step={0.04}
        className={cn(
          "masonry grid grid-cols-1 gap-x-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-5 xl:grid-cols-4",
          ready && "[grid-auto-rows:8px]",
        )}
        key={filter}
      >
        {shown.map((p, i) => (
          <Tile
            key={p._id}
            photo={p}
            index={i}
            heading={i > 0 && i % 7 === 0 ? `${albumTitle}, continued` : null}
            onOpen={() => open(p)}
            refCb={(el) => {
              if (el) tileRefs.current.set(p._id, el);
              else tileRefs.current.delete(p._id);
            }}
          />
        ))}
      </Stagger>

      {openIndex !== null && (
        <Lightbox
          photos={shown}
          index={openIndex}
          onIndex={(i) => {
            setOpenIndex(i);
            syncUrl(shown[i]);
          }}
          onOpen={() => syncUrl(shown[openIndex])}
          onClose={() => {
            setOpenIndex(null);
            syncUrl(null);
          }}
          returnFocus={returnTo}
        />
      )}

      <style>{`
        @supports (grid-template-rows: masonry) {
          .masonry { grid-template-rows: masonry; grid-auto-rows: auto !important; }
          .masonry > * { grid-row-end: auto !important; }
        }
      `}</style>
    </div>
  );
}

function Tile({
  photo,
  index,
  heading,
  onOpen,
  refCb,
}: {
  photo: Photo;
  index: number;
  heading: string | null;
  onOpen: () => void;
  refCb: (el: HTMLButtonElement | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [span, setSpan] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSpan(Math.ceil(el.getBoundingClientRect().height / ROW));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      {heading && (
        <h2 className="t-card col-span-full pt-6 pb-4 sm:hidden" style={{ gridRowEnd: "span 8" }}>
          {heading}
        </h2>
      )}
      <StaggerItem className="self-start" style={span ? { gridRowEnd: `span ${span}` } : undefined}>
        <div ref={ref} className="pb-3 lg:pb-5">
          <figure>
            <Button
              ref={refCb}
              type="button"
              variant="bare"
              size="none"
              onClick={onOpen}
              className="block w-full overflow-hidden rounded-card bg-cord-soft"
              style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
              aria-label={`Open photo: ${photo.alt}`}
            >
              <Image
                src={photo.publicId}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                priority={index < 2}
                loading={index < 2 ? undefined : "lazy"}
                placeholder={photo.blurDataUrl ? "blur" : "empty"}
                blurDataURL={photo.blurDataUrl}
                className="h-full w-full object-contain"
              />
            </Button>
            {photo.caption && <figcaption className="t-meta mt-2 text-ink-muted">{photo.caption}</figcaption>}
          </figure>
        </div>
      </StaggerItem>
    </>
  );
}
