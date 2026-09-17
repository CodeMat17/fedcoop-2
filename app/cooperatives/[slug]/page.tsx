import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Globe } from "lucide-react";
import { JsonLd } from "@/components/shared/JsonLd";
import { PageHero, Rich } from "@/components/shared/Page";
import { getCooperative, getCooperatives } from "@/lib/data";
import { SITE } from "@/lib/site";
import { stateByCode } from "@/lib/states";
import { link } from "@/lib/ui";

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
    description: `${coop.name}, the staff cooperative society of ${coop.mda}. A FEDCOOP member society.`,
    alternates: { canonical: `/cooperatives/${coop.slug}` },
  };
}

export default async function CoopProfile({ params }: PageProps<"/cooperatives/[slug]">) {
  const { slug } = await params;
  const coop = await getCooperative(slug);
  if (!coop) notFound();

  const state = stateByCode(coop.stateCode);
  const url = `${SITE.url}/cooperatives/${coop.slug}`;

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
          memberOf: { "@type": "Organization", name: SITE.legalName, url: SITE.url },
        }}
      />
      <PageHero
        title={coop.name}
        crumbs={[
          { label: "Member Cooperatives", href: "/cooperatives" },
          { label: coop.acronym ?? coop.name, href: `/cooperatives/${coop.slug}` },
        ]}
      />

      <div className="shell space-y-14 pb-24">
        <section aria-labelledby="about-h">
          <h2 id="about-h" className="t-section mb-4">About this society</h2>
          {coop.about ? (
            <Rich html={coop.about} />
          ) : (
            <p>
              {coop.name}
              {coop.acronym ? ` (${coop.acronym})` : ""} is the staff cooperative society of {coop.mda}.
              {coop.foundedYear ? ` Founded in ${coop.foundedYear}, it` : " It"} is a member society of{" "}
              {SITE.legalName}, providing its members with savings, credit and other cooperative services.
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
              <span>This society does not have a website yet.</span>
            )}
          </p>
        </section>
      </div>
    </>
  );
}
