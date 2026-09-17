import type { Metadata } from "next";
import { DirectorCard } from "@/components/about/DirectorCard";
import { EmptyState, PageHero } from "@/components/shared/Page";
import { getDirectors } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Board of Directors",
  description: "The Board of Directors of FEDCOOP, elected by the General Meeting of member cooperative societies.",
  alternates: { canonical: "/directors" },
};

export default async function DirectorsPage() {
  // Key executives first (in rank order), then the other directors.
  const directors = (await getDirectors()).sort(
    (a, b) => Number(b.isExecutive) - Number(a.isExecutive) || a.order - b.order,
  );

  return (
    <>
      <PageHero
        title="Board of Directors"
        crumbs={[{ label: "About", href: "/about" }, { label: "Board of Directors", href: "/directors" }]}
        standfirst="The board is elected by delegates of member societies at the General Meeting and is accountable to them."
      />
      <div className="shell pb-24">
        {directors.length === 0 ? (
          <EmptyState title="The board list has not been published yet." />
        ) : (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {directors.map((d) => (
              <li key={d._id}><DirectorCard d={d} /></li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
