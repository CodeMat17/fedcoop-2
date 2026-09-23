"use client";

import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePageScroll } from "@/components/motion/MotionProvider";
import { CONTACT_CTA, NAV, NAV_SINGLE, PILLARS, type NavGroup } from "@/lib/site";
import { btn, cn } from "@/lib/ui";
import { Logo } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import { MobileNav } from "./MobileNav";
import { openSearch } from "./CommandSearch";

const navItem =
  "relative inline-flex min-h-11 items-center rounded-chip px-2.5 text-[0.93rem] font-semibold text-ink/80 transition-colors hover:text-ink xl:px-3.5 after:absolute after:inset-x-2.5 after:bottom-1.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-cord after:transition-transform after:duration-300 hover:after:scale-x-100 xl:after:inset-x-3.5";
const navActive = "text-cord! after:scale-x-100";

export function Header() {
  const { scrollY } = useScroll();
  const { reduced } = usePageScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 80));
  const barY = useTransform(scrollY, [0, 80], [0, reduced ? 0 : -12], {
    clamp: true,
  });

  // Close the mega panel on navigation (state adjusted during render, not in an effect)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(null);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const solid = scrolled || open !== null;

  return (
    // Fixed 88px footprint so page content never jumps; the plate and bar shrink visually via transforms.
    <header className="sticky top-0 z-50 h-22">
      {/* Background plate: scales from 88px to 64px; transform + opacity only */}
      <m.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 border-b border-cord-line/70 bg-paper/80 shadow-[0_8px_30px_-18px_rgb(16_26_23/0.25)] backdrop-blur-xl backdrop-saturate-150"
        initial={false}
        animate={{ opacity: solid ? 1 : 0, scaleY: scrolled && !reduced ? 64 / 88 : 1 }}
        transition={{ duration: reduced ? 0 : 0.2 }}
        style={{ transformOrigin: "top" }}
      />
      <m.div className="shell flex h-full items-center gap-4" style={{ y: barY }}>
        <Logo />

        <nav ref={navRef} aria-label="Main" className="ml-4 hidden flex-1 xl:block">
          <ul className="flex items-center">
            <li>
              <Link
                href="/"
                onMouseEnter={() => setOpen(null)}
                className={cn(
                  navItem,
                  pathname === "/" && navActive,
                )}
              >
                Home
              </Link>
            </li>
            {NAV.map((g) =>
              !g.links ? (
                <li key={g.label}>
                  <Link
                    href={g.href}
                    onMouseEnter={() => setOpen(null)}
                    className={cn(
                      navItem,
                      pathname.startsWith(g.href) && navActive,
                    )}
                  >
                    {g.label}
                  </Link>
                </li>
              ) : (
                <li key={g.label} className="static">
                  <Button
                    type="button"
                    variant="bare"
                    size="none"
                    aria-expanded={open === g.label}
                    aria-controls={`panel-${g.label}`}
                    onClick={() => setOpen(open === g.label ? null : g.label)}
                    onMouseEnter={() => setOpen(g.label)}
                    className={cn(
                      navItem,
                      (open === g.label || pathname.startsWith(g.href.split("/").slice(0, 2).join("/"))) && navActive,
                    )}
                  >
                    {g.label}
                  </Button>
                  {open === g.label && (
                    <MegaPanel group={g} compact={scrolled && !reduced} onLeave={() => setOpen(null)} />
                  )}
                </li>
              ),
            )}
            {NAV_SINGLE.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onMouseEnter={() => setOpen(null)}
                  className={cn(
                    navItem,
                    pathname.startsWith(l.href) && navActive,
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant="bare"
            size="none"
            onClick={openSearch}
            className="hidden min-h-11 items-center gap-2 rounded-chip px-3 text-ink-muted hover:bg-cord-soft hover:text-ink md:inline-flex"
            aria-label="Search the site"
          >
            <Search className="size-5" strokeWidth={1.5} />
            <kbd className="t-meta hidden rounded-chip border border-cord-line px-1.5 font-sans xl:inline">Ctrl K</kbd>
          </Button>
          <ThemeToggle className="" />
          <Link href={CONTACT_CTA.href} className={cn(btn.primary, "hidden md:inline-flex")}>
            <span className="hidden 2xl:inline">{CONTACT_CTA.label}</span>
            <span className="2xl:hidden">{CONTACT_CTA.short}</span>
          </Link>
          <MobileNav />
        </div>
      </m.div>
    </header>
  );
}

function MegaPanel({ group, compact, onLeave }: { group: NavGroup; compact: boolean; onLeave: () => void }) {
  return (
    <div
      id={`panel-${group.label}`}
      className={cn("absolute inset-x-0 border-b border-cord-line bg-paper/95 shadow-[0_30px_60px_-30px_rgb(16_26_23/0.35)] backdrop-blur-xl", compact ? "top-16" : "top-full")}
      onMouseLeave={onLeave}
    >
      <div className="shell grid grid-cols-12 gap-8 py-10">
        <ul className={cn("col-span-7 grid gap-1", group.links!.length > 3 && "grid-cols-2")}>
          {group.links!.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="group block rounded-card px-4 py-3.5 transition-colors hover:bg-cord-soft">
                <span className="t-card flex items-center gap-2 text-ink group-hover:text-cord">
                  {l.label}
                  <ArrowRight className="size-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" strokeWidth={1.5} />
                </span>
                {l.description && <span className="mt-0.5 block text-[0.9rem] text-ink-muted">{l.description}</span>}
              </Link>
            </li>
          ))}
        </ul>
        <div className="col-span-5">
          <PanelCard kind={group.panel} />
        </div>
      </div>
    </div>
  );
}

function PanelCard({ kind }: { kind: NavGroup["panel"] }) {
  const cardCls =
    "relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-card bg-cord p-7 text-paper transition-colors hover:bg-[color-mix(in_oklab,var(--cord)_88%,black)] [&_.text-ink]:text-paper [&_.text-ink-muted]:text-paper/70 [&_.text-cord]:text-brass-soft";
  switch (kind) {
    case "pillars":
      return (
        <div className={cn(cardCls, "hover:bg-cord")}>
          <p className="t-lead text-ink">Six pillars. One union of staff cooperatives.</p>
          <p className="t-meta text-ink-muted">{PILLARS.map((p) => p.name).join(" · ")}</p>
        </div>
      );
    case "media":
      return (
        <Link href="/events" className={cardCls}>
          <p className="t-lead text-ink">AGMs, training workshops and zonal fora.</p>
          <span className="inline-flex items-center gap-1 font-bold text-cord">
            See upcoming events <ArrowRight className="size-4" strokeWidth={1.5} />
          </span>
        </Link>
      );
    default:
      return (
        <Link href="/directors" className={cardCls}>
          <p className="t-lead text-ink">An elected board, accountable to member societies.</p>
          <span className="inline-flex items-center gap-1 font-bold text-cord">
            Board of Directors <ArrowRight className="size-4" strokeWidth={1.5} />
          </span>
        </Link>
      );
  }
}
