import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { ScrollCord } from "@/components/cord/Cord";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/ui";
import { JsonLd } from "./JsonLd";

export type Crumb = { label: string; href: string };

/**
 * Interior page hero (§9): breadcrumbs, kicker, title, standfirst on a soft
 * banded ground with the guilloche texture, closed by a hairline.
 * The kicker defaults to the parent crumb on nested pages.
 */
export function PageHero({
  title,
  standfirst,
  crumbs = [],
  eyebrow,
  children,
}: {
  title: string;
  standfirst?: ReactNode;
  crumbs?: Crumb[];
  eyebrow?: string;
  children?: ReactNode;
}) {
  const trail = [{ label: "Home", href: "/" }, ...crumbs];
  const kicker = eyebrow ?? (crumbs.length > 1 ? crumbs[0].label : undefined);
  return (
    <>
      <ScrollCord />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: trail.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            item: `${SITE.url}${c.href}`,
          })),
        }}
      />
      <section className="page-hero relative isolate overflow-hidden border-b border-cord-line">
        <div aria-hidden="true" className="page-hero-bg absolute inset-0 -z-10" />
        <div className="shell relative pt-12 pb-14 md:pt-20 md:pb-20">
          {crumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-10">
              <ol className="t-meta flex flex-wrap items-center gap-1.5 font-medium text-ink-muted">
                {trail.map((c, i) => (
                  <li key={c.href} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight className="size-3.5 opacity-60" strokeWidth={1.5} aria-hidden="true" />}
                    {i === trail.length - 1 ? (
                      <span aria-current="page" className="max-w-[40ch] truncate text-ink">
                        {c.label}
                      </span>
                    ) : (
                      <Link href={c.href} className="transition-colors hover:text-cord">
                        {c.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          {kicker && <p className="eyebrow mb-5">{kicker}</p>}
          <h1 className="t-title max-w-[20ch] text-balance">{title}</h1>
          {standfirst && <div className="t-lead mt-6 max-w-[56ch] text-ink-muted">{standfirst}</div>}
          {children}
        </div>
      </section>
    </>
  );
}

/** Section heading block: kicker, title, and an intro that sits beside the title on wide screens. */
export function SectionHead({
  id,
  eyebrow,
  title,
  intro,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-10 grid gap-6 md:mb-14", intro && "lg:grid-cols-12 lg:items-end", className)}>
      <div className={cn(intro && "lg:col-span-7")}>
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h2 id={id} className="t-section max-w-[24ch] text-balance">
          {title}
        </h2>
      </div>
      {intro && <div className="max-w-[40ch] text-ink-muted lg:col-span-5">{intro}</div>}
    </div>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  className,
  headClassName,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
  headClassName?: string;
}) {
  return (
    <section id={id} className={cn("section below-fold", className)} aria-labelledby={id && title ? `${id}-title` : undefined}>
      <div className="shell relative">
        {title && (
          <SectionHead
            id={id ? `${id}-title` : undefined}
            eyebrow={eyebrow}
            title={title}
            intro={intro}
            className={headClassName}
          />
        )}
        {children}
      </div>
    </section>
  );
}

/** Full-bleed cord band that closes a page with one action (§8.9). */
export function CtaBand({ eyebrow, title, children }: { eyebrow?: string; title: ReactNode; children: ReactNode }) {
  return (
    <section className="relative z-10 overflow-hidden bg-cord py-20 text-paper md:py-28">
      <div
        aria-hidden="true"
        className="guilloche absolute inset-0 opacity-[0.07] [mask-image:radial-gradient(60%_90%_at_85%_50%,#000,transparent)]"
      />
      <div className="shell relative grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          {eyebrow && <p className="eyebrow text-paper/70!">{eyebrow}</p>}
          <h2 className="mt-6 max-w-[22ch] text-[clamp(2rem,1.4rem+2.6vw,3.5rem)] leading-[1.05] font-black tracking-[-0.04em] text-balance">
            {title}
          </h2>
        </div>
        <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-self-end">{children}</div>
      </div>
    </section>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-card border border-cord-line bg-paper-raise/60 px-6 py-14 text-center">
      <span aria-hidden="true" className="mx-auto mb-5 grid size-12 place-items-center rounded-full border border-cord-line">
        <span className="size-2 rounded-full bg-brass" />
      </span>
      <p className="t-card">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-[44ch] text-[0.95rem] text-ink-muted">{children}</div>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}

export function Rich({ html, className }: { html: string; className?: string }) {
  return <div className={cn("rich", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
