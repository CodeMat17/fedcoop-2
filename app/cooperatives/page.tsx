import type { Metadata } from "next";
import { Suspense } from "react";
import { Directory } from "@/components/directory/Directory";
import { PageHero } from "@/components/shared/Page";
import { getCooperatives } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "All Cooperatives",
  description: "Cooperative directory Nigeria: search FEDCOOP's member staff cooperative societies by name, MDA, state and service.",
  alternates: { canonical: "/cooperatives" },
};

export default async function CooperativesPage() {
  const coops = await getCooperatives();
  return (
    <>
      <PageHero
        title="All Cooperatives"
        crumbs={[{ label: "Member Cooperatives", href: "/cooperatives" }]}
        standfirst="The national directory of staff cooperative societies affiliated to FEDCOOP."
      />
      <div className="shell pb-24">
        <Suspense fallback={<div className="h-[600px]" />}>
          <Directory coops={coops} />
        </Suspense>
      </div>
    </>
  );
}
