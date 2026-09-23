"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef, useState, type PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import type { Testimonial } from "@/lib/types";
import { cn } from "@/lib/ui";

const arrow =
  "grid size-11 place-items-center rounded-full border border-cord-line text-ink transition-colors hover:border-cord hover:bg-cord hover:text-paper";

/**
 * One quote at a time, spotlighted. Every quote sits in the same grid cell so
 * the block keeps the height of the longest and never jumps. Swipeable, never
 * auto-advancing (§8.8).
 */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const count = items.length;
  const go = (i: number) => setIndex((i + count) % count);

  const onDown = (e: PointerEvent) => {
    startX.current = e.clientX;
  };
  const onUp = (e: PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) > 48) go(index + (dx < 0 ? 1 : -1));
  };

  return (
    <div role="region" aria-roledescription="carousel" aria-label="What member societies say" className="mx-auto max-w-4xl text-center">
      <svg viewBox="0 0 48 36" aria-hidden="true" className="mx-auto h-7 w-9 fill-brass">
        <path d="M0 36V22.1C0 9.9 6.3 2.5 18.9 0l2 4.4c-6.2 1.9-9.4 5.6-9.8 11h8.8V36H0Zm27.1 0V22.1C27.1 9.9 33.4 2.5 46 0l2 4.4c-6.2 1.9-9.4 5.6-9.8 11H47V36H27.1Z" />
      </svg>

      <div className="mt-6 grid touch-pan-y select-none" onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => (startX.current = null)}>
        {items.map((t, i) => {
          const active = i === index;
          return (
            <figure
              key={t._id}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!active}
              className={cn(
                "col-start-1 row-start-1 flex flex-col items-center justify-center transition-[opacity,transform,filter] duration-500 ease-out",
                active ? "opacity-100 blur-0" : "pointer-events-none translate-y-2 opacity-0 blur-[2px]",
              )}
            >
              <blockquote
                className={cn(
                  "font-semibold tracking-[-0.02em] text-balance text-ink",
                  t.quote.length > 280
                    ? "text-[clamp(1.125rem,1rem+0.6vw,1.5rem)] leading-[1.5]"
                    : "text-[clamp(1.25rem,1.05rem+0.9vw,1.875rem)] leading-[1.4]",
                )}
              >
                {t.quote}
              </blockquote>
              <figcaption className="mt-8 text-[0.95rem]">
                <span className="font-semibold text-ink">{t.name}</span>
                {t.role && <span className="text-ink-muted"> — {t.role}</span>}
              </figcaption>
            </figure>
          );
        })}
      </div>

      {count > 1 && (
        <div className="mt-10 flex items-center justify-center gap-4 sm:gap-6">
          <Button type="button" variant="bare" size="none" onClick={() => go(index - 1)} className={arrow} aria-label="Previous testimonial">
            <ArrowLeft className="size-4" strokeWidth={1.5} />
          </Button>

          <div className="flex items-center gap-4">
            <span className="t-meta w-6 text-right text-ink tabular-nums" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="flex items-center">
              {items.map((t, i) => (
                <Button
                  key={t._id}
                  type="button"
                  variant="bare"
                  size="none"
                  onClick={() => go(i)}
                  aria-label={`Show testimonial ${i + 1} of ${count}`}
                  aria-current={i === index}
                  className="group grid h-11 place-items-center px-1"
                >
                  <span
                    className={cn(
                      "block h-0.5 rounded-full transition-all duration-500",
                      i === index ? "w-10 bg-cord" : "w-5 bg-cord-line group-hover:bg-ink-muted",
                    )}
                  />
                </Button>
              ))}
            </div>
            <span className="t-meta w-6 text-ink-muted tabular-nums" aria-hidden="true">
              {String(count).padStart(2, "0")}
            </span>
          </div>

          <Button type="button" variant="bare" size="none" onClick={() => go(index + 1)} className={arrow} aria-label="Next testimonial">
            <ArrowRight className="size-4" strokeWidth={1.5} />
          </Button>
        </div>
      )}
    </div>
  );
}
