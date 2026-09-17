import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { ScrollCord } from "@/components/cord/Cord";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/ui";
import { JsonLd } from "./JsonLd";

export type Crumb = { label: string; href: string };

/** Interior page hero: breadcrumbs, title, standfirst, cord rule beneath (§9). */
export function PageHero({
  title,
  standfirst,
  crumbs = [],
  children,
}: {
  title: string;
  standfirst?: ReactNode;
  crumbs?: Crumb[];
  children?: ReactNode;
}) {
  const trail = [{ label: "Home", href: "/" }, ...crumbs];
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
      <div className="shell relative pt-28 pb-12 md:pt-40 md:pb-16">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="t-meta flex flex-wrap items-center gap-1 text-ink-muted">
              {trail.map((c, i) => (
                <li key={c.href} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" />}
                  {i === trail.length - 1 ? (
                    <span aria-current="page" className="text-ink">
                      {c.label}
                    </span>
                  ) : (
                    <Link href={c.href} className="hover:text-cord">
                      {c.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="t-title max-w-[22ch]">{title}</h1>
        {standfirst && <div className="t-lead mt-5 max-w-[52ch] text-ink-muted">{standfirst}</div>}
        {children}
        <div aria-hidden="true" className="mt-12 h-[2px] w-24 bg-cord" />
      </div>
    </>
  );
}

export function Section({
  id,
  title,
  intro,
  children,
  className,
  headClassName,
}: {
  id?: string;
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
          <div className={cn("mb-10 md:mb-14", headClassName)}>
            <h2 id={id ? `${id}-title` : undefined} className="t-section max-w-[28ch]">
              {title}
            </h2>
            {intro && <div className="mt-4 max-w-[34rem] text-ink-muted">{intro}</div>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-cord-line px-6 py-12 text-center">
      <p className="t-card">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-[44ch] text-ink-muted">{children}</div>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}

export function Rich({ html, className }: { html: string; className?: string }) {
  return <div className={cn("rich", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
