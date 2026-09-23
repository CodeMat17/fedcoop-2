"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ChevronRight } from "lucide-react";
import { PAGE_BLOCKS } from "@/components/admin/pageBlocks";
import { Loading, PageHead, Status } from "@/components/admin/ui";
import { api } from "@/convex/_generated/api";
import { fmtDate } from "@/lib/format";
import { card, cn } from "@/lib/ui";

export default function PagesAdmin() {
  const rows = useQuery(api.admin.pages.list);
  if (!rows) return <Loading />;
  return (
    <>
      <PageHead title="Pages" description="Editable text blocks on the About, Home, Privacy and Terms pages. An empty block hides that section." />
      <ul className="grid gap-3 md:grid-cols-2">
        {PAGE_BLOCKS.map((b) => {
          const row = rows.find((r) => r.key === b.key);
          return (
            <li key={b.key}>
              <Link href={`/admin/pages/${b.key}`} className={cn(card, "flex items-center gap-4 p-5 hover:border-cord")}>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{row?.title ?? b.title}</p>
                  <p className="text-[0.85rem] text-ink-muted">
                    {b.where}
                    {row && ` · Updated ${fmtDate(row.updatedAt)}`}
                  </p>
                </div>
                <Status on={Boolean(row && !row.isEmpty)} onLabel="Has content" offLabel="Empty" />
                <ChevronRight className="size-4 text-ink-muted" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
