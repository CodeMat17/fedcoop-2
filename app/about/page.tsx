import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBand, PageHero, Rich, Section } from "@/components/shared/Page";
import { getMilestones, getPages, getPartners } from "@/lib/data";
import { SITE } from "@/lib/site";
import { btn, cn } from "@/lib/ui";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About FEDCOOP",
  description: "FEDCOOP is the national umbrella body for staff cooperative societies in Nigeria's federal Ministries, Departments and Agencies.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [pages, milestones, partners] = await Promise.all([
    getPages(["about", "mission", "vision", "values"]),
    getMilestones(),
    getPartners(),
  ]);
  const mvv = [pages.mission, pages.vision, pages.values].filter(Boolean);

  return (
    <>
      <PageHero
        title="About FEDCOOP"
        eyebrow="The federation"
        crumbs={[{ label: "About", href: "/about" }]}
        standfirst={`${SITE.legalName} is the national umbrella body for staff cooperative societies inside Nigeria's federal Ministries, Departments and Agencies.`}
      />

      <Section id="who" eyebrow="Who we are" title="Staff cooperatives, stronger as one federation.">
        {pages.about ? (
          <Rich html={pages.about.body} />
        ) : (
          <div className="rich">
            <p>
              Almost every federal MDA has a staff cooperative society. Civil servants save through it, borrow from it, and
              use it to buy homes, vehicles and household goods at fair terms. On their own, these societies are strong
              inside their agency and invisible outside it.
            </p>
            <p>
              FEDCOOP brings them together as one federation. It sets shared standards, trains management committees,
              organises peer review, represents cooperators to government and regulators, and pools the strength of member
              societies for partnerships and investment.
            </p>
            <p>
              Member societies include the staff cooperatives of agencies such as NFVCB, CBN, ICPC, NTA, NBC, EFCC, NCC,
              NNPC, FMAFS and FMTI, drawn from all 36 states and the FCT.
            </p>
          </div>
        )}
      </Section>

      {mvv.length > 0 && (
        <Section id="mission">
          <p className="eyebrow">Our purpose</p>
          <div className={cn("mt-10 grid gap-x-12 gap-y-12", mvv.length > 1 && "md:grid-cols-2", mvv.length > 2 && "lg:grid-cols-3")}>
            {mvv.map((p) => (
              <div key={p!.key} className="border-t border-ink/80 pt-6">
                <h2 className="t-meta tracking-[0.12em] text-ink-muted uppercase">{p!.title}</h2>
                <Rich html={p!.body} className="mt-5 text-[clamp(1.125rem,1rem+0.5vw,1.375rem)] leading-[1.45] font-semibold tracking-[-0.015em] text-ink" />
              </div>
            ))}
          </div>
        </Section>
      )}

      {milestones.length > 0 && (
        <Section id="history" eyebrow="Since the beginning" title="History">
          <ol className="relative max-w-3xl">
            <span aria-hidden="true" className="absolute top-2 bottom-2 left-[1.4rem] w-[2px] bg-cord" />
            {milestones.map((m, i) => (
              <li key={m._id} className="relative grid grid-cols-[3rem_1fr] gap-5 pb-10 last:pb-0">
                <span className="tabular relative z-10 grid size-12 place-items-center rounded-full border-2 border-cord bg-paper font-black text-cord shadow-[0_0_0_6px_var(--paper)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="pt-1">
                  <p className="t-meta tabular text-brass-ink">{m.year}</p>
                  <h3 className="t-card mt-1">{m.title}</h3>
                  <p className="mt-2 text-ink-muted">{m.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      <Section id="governance" eyebrow="Governance" title="How the federation is governed">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <figure className="rounded-card border border-cord-line bg-paper-raise p-6 md:p-10">
            <svg viewBox="0 0 480 380" className="h-auto w-full" role="img" aria-labelledby="gov-title gov-desc">
              <title id="gov-title">FEDCOOP governance structure</title>
              <desc id="gov-desc">
                Member societies send delegates to the General Meeting. The General Meeting elects the Board of Directors.
                The Board appoints and oversees the Secretariat, which serves the member societies.
              </desc>
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0 0 10 5 0 10z" fill="var(--cord)" />
                </marker>
              </defs>
              {[
                { y: 10, label: "General Meeting", sub: "Delegates of every member society" },
                { y: 130, label: "Board of Directors", sub: "Elected by the General Meeting" },
                { y: 250, label: "Secretariat", sub: "Runs programmes day to day" },
              ].map((b) => (
                <g key={b.label}>
                  <rect x="110" y={b.y} width="260" height="80" rx="12" fill="var(--paper-raise)" stroke="var(--cord)" strokeWidth="1.5" />
                  <text x="240" y={b.y + 36} textAnchor="middle" className="fill-ink text-[17px] font-extrabold">{b.label}</text>
                  <text x="240" y={b.y + 58} textAnchor="middle" className="fill-ink-muted text-[12.5px]">{b.sub}</text>
                </g>
              ))}
              <line x1="240" y1="90" x2="240" y2="126" stroke="var(--cord)" strokeWidth="2" markerEnd="url(#arrow)" />
              <line x1="240" y1="210" x2="240" y2="246" stroke="var(--cord)" strokeWidth="2" markerEnd="url(#arrow)" />
              <rect x="0" y="120" width="92" height="140" rx="12" fill="var(--cord-soft)" stroke="var(--cord-line)" />
              <text x="46" y="182" textAnchor="middle" className="fill-ink text-[13px] font-extrabold">Member</text>
              <text x="46" y="200" textAnchor="middle" className="fill-ink text-[13px] font-extrabold">societies</text>
              <path d="M46 120 C46 60 70 50 106 50" stroke="var(--cord)" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
              <path d="M106 290 C70 290 46 300 46 264" stroke="var(--brass)" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
            </svg>
          </figure>
          <div className="max-w-[34rem] space-y-5 [&_p]:border-l-2 [&_p]:border-cord-line [&_p]:pl-5 [&_strong]:text-ink">
            <p><strong>Member societies</strong> are independent cooperatives. Each keeps its own bye-laws, committee and funds.</p>
            <p><strong>The General Meeting</strong> is the federation&apos;s highest authority. Every member society sends delegates, who approve accounts, set dues and elect the board.</p>
            <p><strong>The Board of Directors</strong> sets direction between meetings and is accountable to the General Meeting.</p>
            <p><strong>The Secretariat</strong> runs training, peer review, advocacy and partnership programmes, and is the first point of contact for member societies.</p>
          </div>
        </div>
      </Section>

      {partners.length > 0 && (
        <Section id="partners" eyebrow="Partners" title="Affiliations and partners">
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {partners.map((p) => {
              const logo = (
                <span className="relative block aspect-[3/2] rounded-card border border-cord-line bg-paper-raise p-4 grayscale transition duration-200 hover:grayscale-0">
                  <Image src={p.logoUrl} alt={p.name} fill sizes="200px" className="object-contain p-4" />
                </span>
              );
              return (
                <li key={p._id}>
                  {p.url ? (
                    <a href={p.url} target="_blank" rel="noopener noreferrer">{logo}</a>
                  ) : (
                    logo
                  )}
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      <CtaBand eyebrow="Leadership" title="Meet the people elected to lead the federation.">
        <Link href="/directors" className={cn(btn.onCord, "min-h-12 px-6")}>
          Board of Directors <ArrowRight className="size-4" strokeWidth={1.5} />
        </Link>
      </CtaBand>
    </>
  );
}
