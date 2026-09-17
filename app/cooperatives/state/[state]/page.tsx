import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CoopCard } from "@/components/shared/Cards";
import { EmptyState, PageHero } from "@/components/shared/Page";
import { getCooperatives, getStateStats } from "@/lib/data";
import { fmtDate, fmtNumber } from "@/lib/format";
import { MEMBERSHIP_CTA } from "@/lib/site";
import { STATES, stateBySlug } from "@/lib/states";
import { btn, link } from "@/lib/ui";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return STATES.map((s) => ({ state: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/cooperatives/state/[state]">): Promise<Metadata> {
  const s = stateBySlug((await params).state);
  if (!s) return {};
  const where = s.code === "NG-FC" ? "the FCT" : s.name;
  return {
    title: `Cooperatives in ${where}`,
    description: `Federal staff cooperative societies in ${where} affiliated to FEDCOOP.`,
    alternates: { canonical: `/cooperatives/state/${s.slug}` },
  };
}

export default async function StatePage({ params }: PageProps<"/cooperatives/state/[state]">) {
  const s = stateBySlug((await params).state);
  if (!s) notFound();
  const [stats, coops] = await Promise.all([getStateStats(), getCooperatives()]);
  const stat = stats.find((x) => x.stateCode === s.code);
  const list = coops.filter((c) => c.stateCode === s.code).sort((a, b) => a.name.localeCompare(b.name));
  const where = s.code === "NG-FC" ? "the FCT" : s.name;

  return (
    <>
      <PageHero
        title={`Cooperatives in ${where}`}
        crumbs={[
          { label: "Member Cooperatives", href: "/cooperatives" },
          { label: s.name, href: `/cooperatives/state/${s.slug}` },
        ]}
      >
        <div className="mt-8">
          {stat ? (
            <>
              <p className="t-stat text-cord">{fmtNumber(stat.cooperativeCount)}</p>
              <p className="t-meta mt-2 text-ink-muted">
                verified cooperative societies · last verified {fmtDate(stat.verifiedAt)}
              </p>
            </>
          ) : (
            <p className="t-lead text-ink-muted">We have no verified figure for this state yet.</p>
          )}
        </div>
      </PageHero>

      <div className="shell pb-24">
        <Link href="/cooperatives" className={`${link} inline-flex min-h-11 items-center gap-1`}>
          <ArrowLeft className="size-4" strokeWidth={1.5} /> Back to all cooperatives
        </Link>

        <h2 className="t-section mt-8 mb-6">Societies listed in {where}</h2>
        {list.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((c) => (
              <li key={c._id}>
                <CoopCard coop={c} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title={`No society in ${where} is listed in the directory yet.`}
            action={
              <Link href={MEMBERSHIP_CTA.href} className={btn.primary}>
                {MEMBERSHIP_CTA.label}
              </Link>
            }
          >
            If your cooperative serves federal staff in {where}, tell FEDCOOP about it.
          </EmptyState>
        )}
      </div>
    </>
  );
}
