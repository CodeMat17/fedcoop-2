"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import {
  Building2,
  CalendarDays,
  ExternalLink,
  FileStack,
  FileText,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  ShieldCheck,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/ui";

type Item = { href: string; label: string; icon: LucideIcon; badge?: "enquiries" };

const NAV: { group: string; items: Item[] }[] = [
  { group: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    group: "Content",
    items: [
      { href: "/admin/news", label: "News", icon: Newspaper },
      { href: "/admin/events", label: "Events", icon: CalendarDays },
      { href: "/admin/gallery", label: "Gallery", icon: Images },
      { href: "/admin/resources", label: "Resources", icon: FileText },
      { href: "/admin/pages", label: "Pages", icon: FileStack },
    ],
  },
  {
    group: "Directory",
    items: [
      { href: "/admin/cooperatives", label: "Cooperatives", icon: Building2 },
      { href: "/admin/directors", label: "Directors", icon: UsersRound },
    ],
  },
  {
    group: "Inbox",
    items: [
      { href: "/admin/enquiries", label: "Enquiries", icon: Inbox, badge: "enquiries" },
      { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
    ],
  },
  { group: "Access", items: [{ href: "/admin/users", label: "Users", icon: ShieldCheck }] },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { signOut } = useClerk();
  const newEnquiries = useQuery(api.admin.inbox.newCount);

  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  const nav = (
    <nav aria-label="Admin" className="flex flex-col gap-6 px-3 py-6">
      {NAV.map((g) => (
        <div key={g.group}>
          <p className="mb-2 px-3 text-[0.7rem] font-bold tracking-[0.14em] text-ink-muted uppercase">{g.group}</p>
          <ul className="space-y-0.5">
            {g.items.map(({ href, label, icon: Icon, badge }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex min-h-10 items-center gap-3 rounded-chip px-3 text-[0.93rem] font-semibold text-ink/80 transition-colors hover:bg-cord-soft hover:text-ink",
                    isActive(href) && "bg-cord-soft text-cord",
                  )}
                >
                  <Icon className="size-4.5 shrink-0" aria-hidden="true" />
                  <span className="flex-1">{label}</span>
                  {badge && !!newEnquiries && (
                    <span className="rounded-full bg-brass px-2 py-0.5 text-[0.72rem] font-bold text-paper">
                      {newEnquiries}
                      <span className="sr-only"> new</span>
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-svh bg-paper">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-cord-line bg-paper-raise/90 px-4 backdrop-blur md:px-6">
        <button
          type="button"
          className="grid size-10 place-items-center rounded-chip hover:bg-cord-soft lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <Link href="/admin" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-2.webp" alt="" width={32} height={32} className="rounded-full" />
          <span className="text-[1.1rem] font-black tracking-[-0.03em]">FEDCOOP</span>
          <span className="rounded-chip bg-cord-soft px-2 py-0.5 text-[0.72rem] font-bold tracking-[0.1em] text-cord uppercase">Admin</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="hidden min-h-10 items-center gap-1.5 rounded-chip px-3 text-[0.9rem] font-semibold text-ink-muted hover:bg-cord-soft hover:text-ink sm:inline-flex"
          >
            View site <ExternalLink className="size-3.5" aria-hidden="true" />
          </Link>
          <ThemeToggle />
          <UserButton />
          <button
            type="button"
            onClick={() => signOut({ redirectUrl: "/admin/sign-in" })}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-chip border border-cord-line px-3 text-[0.9rem] font-semibold text-ink hover:border-cord hover:text-cord"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Sign out</span>
            <span className="sr-only sm:hidden">Sign out</span>
          </button>
        </div>
      </header>

      <aside className="fixed top-16 bottom-0 left-0 hidden w-64 overflow-y-auto border-r border-cord-line bg-paper-raise lg:block">
        {nav}
      </aside>

      {open && (
        <div className="fixed inset-0 top-16 z-30 lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-ink/30" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-72 max-w-[85vw] overflow-y-auto border-r border-cord-line bg-paper-raise">{nav}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-10">{children}</div>
      </div>
    </div>
  );
}
