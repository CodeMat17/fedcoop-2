import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResults } from "@/components/layout/SearchPage";
import { PageHero } from "@/components/shared/Page";

export const metadata: Metadata = {
  title: "Search",
  description: "Search FEDCOOP's cooperatives, MDAs, states, news, events and pages.",
  robots: { index: false },
};

export default function SearchPage() {
  return (
    <>
      <PageHero title="Search" crumbs={[{ label: "Search", href: "/search" }]} />
      <div className="shell pb-24">
        <Suspense fallback={<div className="h-16" />}>
          <SearchResults />
        </Suspense>
      </div>
    </>
  );
}
