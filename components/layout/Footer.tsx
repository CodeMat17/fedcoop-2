import Link from "next/link";
import { SITE } from "@/lib/site";
import { Logo, SocialLinks } from "./Brand";
import { Newsletter } from "./Newsletter";

const QUICK = [
  { label: "About FEDCOOP", href: "/about" },
  { label: "Member Cooperatives", href: "/cooperatives" },
  { label: "Recent Events", href: "/events" },
  { label: "Board of Directors", href: "/directors" },
  { label: "Contact", href: "/contact" },
];

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      {/* Mobile: accordion via native details; desktop: always open */}
      <details className="group border-b border-cord-line md:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between font-bold">
          {title}
          <span aria-hidden="true" className="text-ink-muted transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <div className="pb-5">{children}</div>
      </details>
      <div className="hidden md:block">
        <h2 className="t-card mb-4">{title}</h2>
        {children}
      </div>
    </>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 border-t border-cord-line bg-paper">
      <div className="shell grid gap-10 py-16 md:grid-cols-2 md:gap-12 xl:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-[30ch] font-bold leading-snug">{SITE.legalName}</p>
          <p className="mt-3 max-w-[40ch] text-[0.95rem] text-ink-muted">{SITE.motto}</p>
          <SocialLinks className="mt-4 -ml-3" />
        </div>

        <div className="md:contents xl:block">
          <Column title="Quick links">
            <ul className="space-y-1">
              {QUICK.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-11 items-center text-ink-muted hover:text-cord md:min-h-9">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Column>
        </div>

        <div>
          <Column title="Contact">
            <address className="not-italic text-ink-muted">
              {SITE.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <a href={SITE.phoneHref} className="mt-3 inline-flex min-h-11 items-center font-semibold text-ink hover:text-cord md:min-h-9">
                {SITE.phone}
              </a>
              <br />
              <a href={`mailto:${SITE.email}`} className="inline-flex min-h-11 items-center font-semibold text-ink hover:text-cord md:min-h-9">
                {SITE.email}
              </a>
            </address>
          </Column>
        </div>

        <div>
          <Column title="Get FEDCOOP updates">
            <Newsletter />
          </Column>
        </div>
      </div>

      <div className="border-t border-cord-line">
        <div className="shell t-meta flex flex-col gap-2 py-6 text-ink-muted md:flex-row md:items-center md:justify-between">
          <p>© {year} FEDCOOP — {SITE.legalName}.</p>
          <ul className="flex gap-5">
            <li>
              <Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-cord">Privacy</Link>
            </li>
            <li>
              <Link href="/terms" className="inline-flex min-h-11 items-center hover:text-cord">Terms</Link>
            </li>
            <li>
              <Link href="/admin" prefetch={false} className="inline-flex min-h-11 items-center opacity-70 hover:text-cord">Admin</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
