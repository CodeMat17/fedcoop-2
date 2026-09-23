import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between font-bold">
          {title}
          <span aria-hidden="true" className="text-ink-muted transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <div className="pb-5">{children}</div>
      </details>
      <div className="hidden md:block">
        <h2 className="eyebrow mb-6">{title}</h2>
        {children}
      </div>
    </>
  );
}

/** Dark institutional footer: the `.dark` class re-maps every token inside it, in either theme. */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="dark relative z-10 overflow-hidden bg-paper text-ink">
      <div
        aria-hidden="true"
        className="guilloche absolute inset-0 opacity-[0.03] [mask-image:radial-gradient(60%_70%_at_90%_10%,#000,transparent)]"
      />
      <div className="shell relative grid gap-10 pt-20 pb-14 md:grid-cols-2 md:gap-14 xl:grid-cols-[1.5fr_1fr_1.1fr_1.3fr]">
        <div>
          <Logo />
          <p className="mt-6 max-w-[30ch] leading-snug font-bold">{SITE.legalName}</p>
          <p className="mt-3 max-w-[42ch] text-[0.95rem] text-ink-muted">{SITE.motto}</p>
          <SocialLinks className="mt-6 -ml-3" />
        </div>

        <div className="md:contents xl:block">
          <Column title="Quick links">
            <ul className="space-y-0.5">
              {QUICK.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="group inline-flex min-h-11 items-center gap-1.5 text-ink-muted transition-colors hover:text-ink md:min-h-9"
                  >
                    {l.label}
                    <ArrowUpRight
                      className="size-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Column>
        </div>

        <div>
          <Column title="Contact">
            <address className="text-ink-muted not-italic">
              {SITE.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <a href={SITE.phoneHref} className="mt-4 inline-flex min-h-11 items-center font-semibold text-ink transition-colors hover:text-cord md:min-h-9">
                {SITE.phone}
              </a>
              <br />
              <a href={`mailto:${SITE.email}`} className="inline-flex min-h-11 items-center font-semibold text-ink transition-colors hover:text-cord md:min-h-9">
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

      {/* Oversized wordmark, clipped by the footer edge */}
      <div aria-hidden="true" className="shell relative select-none">
        <p className="-mb-[0.22em] text-[clamp(4.5rem,1rem+15vw,15rem)] leading-none font-black tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_var(--cord-line)]">
          FEDCOOP
        </p>
      </div>

      <div className="relative border-t border-cord-line bg-paper">
        <div className="shell t-meta flex flex-col gap-2 py-6 font-medium text-ink-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {year} FEDCOOP — {SITE.legalName}.
          </p>
          <ul className="flex gap-6">
            <li>
              <Link href="/privacy" className="inline-flex min-h-11 items-center transition-colors hover:text-ink">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="inline-flex min-h-11 items-center transition-colors hover:text-ink">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/admin" prefetch={false} className="inline-flex min-h-11 items-center opacity-60 transition-colors hover:text-ink">
                Admin
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
