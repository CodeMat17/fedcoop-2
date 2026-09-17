"use client";

import { Dialog } from "@base-ui/react/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, type PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import cloudinaryLoader from "@/lib/cloudinary-loader";
import { fmtDate } from "@/lib/format";
import type { Photo } from "@/lib/types";

export default function Lightbox({
  photos,
  index,
  onIndex,
  onOpen,
  onClose,
  returnFocus,
}: {
  photos: Photo[];
  index: number;
  onIndex: (i: number) => void;
  onOpen: () => void;
  onClose: () => void;
  returnFocus: HTMLElement | null;
}) {
  const photo = photos[index];
  const startX = useRef<number | null>(null);
  const prev = () => onIndex((index - 1 + photos.length) % photos.length);
  const next = () => onIndex((index + 1) % photos.length);

  useEffect(onOpen, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Preload the two adjacent images only (§14.3)
  useEffect(() => {
    for (const offset of [-1, 1]) {
      const p = photos[(index + offset + photos.length) % photos.length];
      if (p && p !== photo) new window.Image().src = cloudinaryLoader({ src: p.publicId, width: 1600 });
    }
  }, [index, photos, photo]);

  const onPointerDown = (e: PointerEvent) => {
    startX.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
  };

  if (!photo) return null;
  const control = "grid size-12 place-items-center rounded-full border border-cord-line bg-paper-raise text-ink hover:border-cord";

  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[80] bg-paper/96 backdrop-blur-md" />
        <Dialog.Popup
          finalFocus={returnFocus ? { current: returnFocus } : undefined}
          className="fixed inset-0 z-[81] flex flex-col shadow-2xl outline-none"
        >
          <Dialog.Title className="sr-only">{photo.alt}</Dialog.Title>
          <div className="flex items-center justify-between px-4 py-3">
            <p className="t-meta tabular text-ink-muted" aria-live="polite">
              {index + 1} of {photos.length}
            </p>
            <Dialog.Close className={control} aria-label="Close photo viewer">
              <X className="size-5" strokeWidth={1.5} />
            </Dialog.Close>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 touch-pan-y" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
            <Image
              key={photo._id}
              src={photo.publicId}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="100vw"
              placeholder={photo.blurDataUrl ? "blur" : "empty"}
              blurDataURL={photo.blurDataUrl}
              className="max-h-full w-auto max-w-full object-contain"
              style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
            />
            {photos.length > 1 && (
              <>
                <Button type="button" variant="bare" size="none" onClick={prev} className={`${control} absolute left-4 hidden md:grid`} aria-label="Previous photo">
                  <ChevronLeft className="size-6" strokeWidth={1.5} />
                </Button>
                <Button type="button" variant="bare" size="none" onClick={next} className={`${control} absolute right-4 hidden md:grid`} aria-label="Next photo">
                  <ChevronRight className="size-6" strokeWidth={1.5} />
                </Button>
              </>
            )}
          </div>

          <div className="flex items-end justify-between gap-4 px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] md:px-8">
            <div className="max-w-[60ch]">
              {photo.caption && <p className="font-semibold">{photo.caption}</p>}
              <p className="t-meta mt-1 text-ink-muted">
                {[photo.category, photo.takenAt && fmtDate(photo.takenAt)].filter(Boolean).join(" · ")}
              </p>
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 md:hidden">
                <Button type="button" variant="bare" size="none" onClick={prev} className={control} aria-label="Previous photo">
                  <ChevronLeft className="size-6" strokeWidth={1.5} />
                </Button>
                <Button type="button" variant="bare" size="none" onClick={next} className={control} aria-label="Next photo">
                  <ChevronRight className="size-6" strokeWidth={1.5} />
                </Button>
              </div>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
