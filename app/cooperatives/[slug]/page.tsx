import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CircleDashed, Globe } from "lucide-react";
import { JsonLd } from "@/components/shared/JsonLd";
import { PageHero, Rich } from "@/components/shared/Page";
import { RegistrationBadge } from "@/components/shared/RegistrationBadge";
import { getCooperative, getCooperatives } from "@/lib/data";
import { MEMBERSHIP_CTA, SITE } from "@/lib/site";
import { stateByCode } from "@/lib/states";
import { btn, cn, link } from "@/lib/ui";

export const revalidate = 3600;

export async function generateStaticParams() {
  const coops = await getCooperatives();
  return coops.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/cooperatives/[slug]">): Promise<Metadata> {
  const coop = await getCooperative((await params).slug);
  if (!coop) return {};
  return {
    title: coop.name,
    description: coop.isRegistered
      ? `${coop.name}, the staff cooperative society of ${coop.mda}. A FEDCOOP member society.`
      : `${coop.name}, the staff cooperative society of ${coop.mda}. Not yet registered with FEDCOOP.`,
    alternates: { canonical: `/cooperatives/${coop.slug}` },
  };
}

export default async function CoopProfile({ params }: PageProps<"/cooperatives/[slug]">) {
  const { slug } = await params;
  const coop = await getCooperative(slug);
  if (!coop) notFound();

  const state = stateByCode(coop.stateCode);
  const url = `${SITE.url}/cooperatives/${coop.slug}`;
  const registered = !!coop.isRegistered;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: coop.name,
          alternateName: coop.acronym,
          url,
          logo: coop.logoUrl,
          email: coop.contactEmail,
          telephone: coop.contactPhone,
          foundingDate: coop.foundedYear ? String(coop.foundedYear) : undefined,
          address: state ? { "@type": "PostalAddress", streetAddress: coop.address, addressLocality: coop.city, addressRegion: state.name, addressCountry: "NG" } : undefined,
          memberOf: registered ? { "@type": "Organization", name: SITE.legalName, url: SITE.url } : undefined,
        }}
      />
      <PageHero
        title={coop.name}
        crumbs={[
          { label: "Member Cooperatives", href: "/cooperatives" },
          { label: coop.acronym ?? coop.name, href: `/cooperatives/${coop.slug}` },
        ]}
      >
        <RegistrationBadge registered={registered} className="mt-6 px-3 py-1" />
      </PageHero>

      <div className="shell space-y-14 pb-24">
        {!registered && (
          <section
            aria-labelledby="unregistered-h"
            className="relative overflow-hidden rounded-card border border-brass/30 bg-brass-soft/60 p-6 md:p-8"
          >
            <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-brass" />
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-6">
              <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-paper-raise text-brass ring-1 ring-brass/25">
                <CircleDashed className="size-6" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="unregistered-h" className="t-card">
                  This cooperative is not yet registered with {SITE.name}
                </h2>
                <p className="mt-2 max-w-[62ch] text-ink-muted">
                  {coop.name} appears in our directory, but its registration with {SITE.name} has not been completed.
                  Until it is, the society is not covered by {SITE.name} membership services, representation or peer review.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link href={MEMBERSHIP_CTA.href} className={cn(btn.primary, "gap-2")}>
                    Register this society <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
                  </Link>
                  <Link href="/cooperatives?status=registered" className={cn(btn.ghost, "gap-2")}>
                    <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" /> View registered societies
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        <section aria-labelledby="about-h">
          <h2 id="about-h" className="t-section mb-4">About this society</h2>
          {coop.about ? (
            <Rich html={coop.about} />
          ) : (
            <p>
              {coop.name}
              {coop.acronym ? ` (${coop.acronym})` : ""} is the staff cooperative society of {coop.mda}.
              {registered ? (
                <>
                  {coop.foundedYear ? ` Founded in ${coop.foundedYear}, it` : " It"} is a member society of{" "}
                  {SITE.legalName}, providing its members with savings, credit and other cooperative services.
                </>
              ) : (
                <>{coop.foundedYear ? ` It was founded in ${coop.foundedYear}.` : ""}</>
              )}
            </p>
          )}
          <p className="mt-4 flex items-center gap-2">
            <Globe className="size-4 shrink-0" aria-hidden />
            {coop.website ? (
              <span>
                Website:{" "}
                <a href={coop.website} target="_blank" rel="noopener noreferrer" className={link}>
                  {coop.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              </span>
            ) : (
              <span>This society does not have a website yet. Contact 08063856120 to have a premium website and loan application for your cooperative.</span>
            )}
          </p>
        </section>
      </div>
    </>
  );
}
