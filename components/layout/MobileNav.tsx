"use client";

import { Accordion } from "@base-ui/react/accordion";
import { Dialog } from "@base-ui/react/dialog";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CONTACT_CTA, NAV, NAV_SINGLE, SITE } from "@/lib/site";
import { btn, cn } from "@/lib/ui";
import { ThemeToggle } from "./ThemeToggle";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className="grid size-11 place-items-center rounded-chip text-ink hover:bg-cord-soft lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-6" strokeWidth={1.5} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[60] bg-ink/40 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed inset-y-0 right-0 z-[61] flex w-[min(24rem,100vw)] flex-col bg-paper shadow-2xl transition-transform duration-300 data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full">
          <div className="flex h-16 items-center justify-between border-b border-cord-line px-5">
            <Dialog.Title className="t-card">Menu</Dialog.Title>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Dialog.Close
                className="grid size-11 place-items-center rounded-chip hover:bg-cord-soft"
                aria-label="Close menu"
              >
                <X className="size-6" strokeWidth={1.5} />
              </Dialog.Close>
            </div>
          </div>

          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-2">
            <Link href="/" className="flex min-h-12 items-center border-b border-cord-line font-bold">
              Home
            </Link>
            <Accordion.Root>
              {NAV.map((g) =>
                !g.links ? (
                  <Link
                    key={g.label}
                    href={g.href}
                    className="flex min-h-12 items-center border-b border-cord-line font-bold"
                  >
                    {g.label}
                  </Link>
                ) : (
                  <Accordion.Item key={g.label} className="border-b border-cord-line">
                    <Accordion.Header>
                      <Accordion.Trigger className="group flex min-h-12 w-full items-center justify-between text-left font-bold">
                        {g.label}
                        <ChevronDown
                          className="size-5 transition-transform group-data-[panel-open]:rotate-180"
                          strokeWidth={1.5}
                        />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Panel className="h-[var(--accordion-panel-height)] overflow-hidden transition-[height] duration-200 data-[ending-style]:h-0 data-[starting-style]:h-0">
                      <ul className="pb-3">
                        {g.links.map((l) => (
                          <li key={l.href}>
                            <Link
                              href={l.href}
                              className={cn(
                                "flex min-h-11 items-center pl-3 text-ink-muted hover:text-cord",
                                pathname === l.href && "text-cord",
                              )}
                            >
                              {l.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </Accordion.Panel>
                  </Accordion.Item>
                ),
              )}
            </Accordion.Root>
            {NAV_SINGLE.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex min-h-12 items-center border-b border-cord-line font-bold"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="space-y-3 border-t border-cord-line px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <a href={SITE.phoneHref} className="flex min-h-11 items-center gap-2 font-semibold text-ink">
              <Phone className="size-4" strokeWidth={1.5} /> {SITE.phone}
            </a>
            <Link href={CONTACT_CTA.href} className={cn(btn.primary, "w-full")}>
              {CONTACT_CTA.short}
            </Link>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
