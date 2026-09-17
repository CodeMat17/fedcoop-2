"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Testimonial } from "@/lib/types";
import { cn } from "@/lib/ui";

/** Swipeable, never auto-advancing (§8.8). */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const [ref, api] = useEmblaCarousel({ align: "start", loop: false });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setIndex(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const go = useCallback((i: number) => api?.scrollTo(i), [api]);

  return (
    <div role="region" aria-roledescription="carousel" aria-label="What member societies say">
      <div ref={ref} className="overflow-hidden">
        <ul className="-ml-5 flex">
          {items.map((t, i) => (
            <li
              key={t._id}
              className="min-w-0 shrink-0 grow-0 basis-full pl-5 md:basis-1/2 xl:basis-[45%]"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${items.length}`}
            >
              <figure className="flex h-full flex-col justify-between rounded-card border border-cord-line bg-paper-raise p-6 md:p-8">
                <blockquote className="t-lead text-ink">“{t.quote}”</blockquote>
                <figcaption className="mt-6">
                  <span className="block font-bold">{t.name}</span>
                  <span className="t-meta block text-ink-muted">
                    {[[t.role, t.cooperative].filter(Boolean).join(", "), t.mda].filter(Boolean).join(" · ")}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
      {items.length > 1 && (
        <div className="mt-6 flex items-center gap-2">
          <Button
            type="button"
            variant="bare"
            size="none"
            onClick={() => api?.scrollPrev()}
            className="grid size-11 place-items-center rounded-chip border border-cord-line hover:border-cord"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="size-5" strokeWidth={1.5} />
          </Button>
          <div className="flex">
            {items.map((t, i) => (
              <Button
                key={t._id}
                type="button"
                variant="bare"
                size="none"
                onClick={() => go(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                aria-current={i === index}
                className="grid size-11 place-items-center"
              >
                <span className={cn("size-2.5 rounded-full transition-colors", i === index ? "bg-cord" : "bg-cord-line")} />
              </Button>
            ))}
          </div>
          <Button
            type="button"
            variant="bare"
            size="none"
            onClick={() => api?.scrollNext()}
            className="grid size-11 place-items-center rounded-chip border border-cord-line hover:border-cord"
            aria-label="Next testimonial"
          >
            <ChevronRight className="size-5" strokeWidth={1.5} />
          </Button>
        </div>
      )}
    </div>
  );
}
