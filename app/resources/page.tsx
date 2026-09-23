import type { Metadata } from "next";
import { FileDown } from "lucide-react";
import { EmptyState, PageHero } from "@/components/shared/Page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getResources } from "@/lib/data";
import { fmtBytes, fmtDateShort } from "@/lib/format";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Resources",
  description: "Bye-law templates, governance guides, annual reports, peer review checklists and training materials from FEDCOOP.",
  alternates: { canonical: "/resources" },
};

export default async function ResourcesPage() {
  const resources = await getResources();
  const categories = Array.from(new Set(resources.map((r) => r.category))).sort();

  return (
    <>
      <PageHero
        title="Resources"
        eyebrow="Library"
        crumbs={[{ label: "Resources", href: "/resources" }]}
        standfirst="Templates, guides, reports and training materials for management committees and members."
      />
      <div className="shell space-y-14 pb-24">
        {resources.length === 0 ? (
          <EmptyState title="No resources published yet.">Bye-law templates, governance guides and reports will be listed here.</EmptyState>
        ) : (
          <>
            {categories.length > 1 && (
              <nav aria-label="Resource categories">
                <ul className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <li key={c}>
                      <a href={`#${c.toLowerCase().replace(/\W+/g, "-")}`} className="inline-flex min-h-10 items-center rounded-full border border-cord-line bg-paper-raise px-4 text-[0.9rem] font-semibold transition-colors hover:border-cord hover:text-cord">
                        {c}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            {categories.map((c) => (
              <section key={c} id={c.toLowerCase().replace(/\W+/g, "-")} aria-labelledby={`${c}-h`}>
                <h2 id={`${c}-h`} className="t-section mb-6">{c}</h2>
                <div className="overflow-x-auto rounded-card border border-cord-line bg-paper-raise">
                  <Table className="min-w-[40rem] text-left text-base">
                    <TableHeader className="t-meta border-b border-cord-line bg-cord-soft/60 tracking-[0.08em] text-ink-muted uppercase">
                      <TableRow className="hover:bg-transparent">
                        <TableHead scope="col" className="h-auto px-4 py-3 text-ink-muted">Title</TableHead>
                        <TableHead scope="col" className="h-auto px-4 py-3 text-ink-muted">Type</TableHead>
                        <TableHead scope="col" className="h-auto px-4 py-3 text-ink-muted">Size</TableHead>
                        <TableHead scope="col" className="h-auto px-4 py-3 text-ink-muted">Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resources.filter((r) => r.category === c).map((r) => (
                        <TableRow key={r._id} className="border-b border-cord-line transition-colors last:border-0 hover:bg-cord-soft/40">
                          <TableHead scope="row" className="h-auto px-4 py-3 whitespace-normal text-ink">
                            <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 font-bold hover:text-cord">
                              <FileDown className="size-4 shrink-0 text-cord" strokeWidth={1.5} aria-hidden="true" />
                              {r.title}
                            </a>
                            {r.description && <p className="font-normal text-[0.93rem] text-ink-muted">{r.description}</p>}
                          </TableHead>
                          <TableCell className="px-4 py-3 uppercase">{r.fileType}</TableCell>
                          <TableCell className="tabular px-4 py-3">{fmtBytes(r.fileSize)}</TableCell>
                          <TableCell className="tabular px-4 py-3 text-ink-muted">{fmtDateShort(r.updatedAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </section>
            ))}
          </>
        )}
      </div>
    </>
  );
}
