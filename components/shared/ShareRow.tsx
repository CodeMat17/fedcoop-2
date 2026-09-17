"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/ui";

const item = "inline-flex min-h-11 items-center gap-2 rounded-chip border border-cord-line px-3 font-bold text-ink hover:border-cord";

/** WhatsApp first — it matters most for this audience (§12.5). */
export function ShareRow({ url, title, className }: { url: string; title: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const text = encodeURIComponent(`${title} ${url}`);
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="t-meta mr-1 text-ink-muted">Share</span>
      <a href={`https://wa.me/?text=${text}`} target="_blank" rel="noopener noreferrer" className={item} aria-label="Share on WhatsApp">
        WhatsApp
      </a>
      <a
        href={`https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={item}
        aria-label="Share on X"
      >
        X
      </a>
      <Button
        type="button"
        variant="bare"
        size="none"
        className={item}
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? <Check className="size-4" strokeWidth={1.5} /> : <Link2 className="size-4" strokeWidth={1.5} />}
        <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
      </Button>
    </div>
  );
}
