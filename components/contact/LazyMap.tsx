"use client";

import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/** The iframe loads only when it scrolls near view or the visitor asks for it (§15.4). */
export function LazyMap() {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative aspect-[4/3] overflow-hidden rounded-card border border-cord-line bg-cord-soft">
      {show ? (
        <iframe
          title="Map of the Federal Secretariat Complex, Abuja"
          src="https://www.google.com/maps?q=Federal+Secretariat+Complex+Phase+1+Abuja&output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <Button type="button" variant="bare" size="none" onClick={() => setShow(true)} className="absolute inset-0 h-full w-full rounded-none text-cord">
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-5" strokeWidth={1.5} /> Show map
          </span>
        </Button>
      )}
    </div>
  );
}
