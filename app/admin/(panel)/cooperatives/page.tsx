"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Empty, Loading, PageHead, SearchBox, Status, table, useRun } from "@/components/admin/ui";
import { api } from "@/convex/_generated/api";
import { stateByCode } from "@/lib/states";
import { btn, cn, input } from "@/lib/ui";

type Filter = "all" | "published" | "draft" | "registered" | "unverified";
const PAGE = 50;

export default function CooperativesAdmin() {
  const rows = useQuery(api.admin.cooperatives.list);
  const setFlag = useMutation(api.admin.cooperatives.setFlag);
  const { run } = useRun();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [limit, setLimit] = useState(PAGE);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (rows ?? []).filter((c) => {
      if (filter === "published" && !c.isPublished) return false;
      if (filter === "draft" && c.isPublished) return false;
      if (filter === "registered" && !c.isRegistered) return false;
      if (filter === "unverified" && c.isVerified) return false;
      return !term || `${c.name} ${c.acronym ?? ""} ${c.mda}`.toLowerCase().includes(term);
    });
  }, [rows, q, filter]);

  return (
    <>
      <PageHead
        title="Cooperatives"
        description={rows ? `${rows.length} societies in the directory.` : "Member societies in the directory."}
        actions={
          <Link href="/admin/cooperatives/new" className={btn.primary}>
            <Plus aria-hidden="true" /> Add cooperative
          </Link>
        }
      />
      {!rows ? (
        <Loading />
      ) : rows.length === 0 ? (
        <Empty title="The directory is empty" />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <SearchBox value={q} onChange={(v) => { setQ(v); setLimit(PAGE); }} placeholder="Search name, acronym or MDA" />
            <select aria-label="Filter" className={cn(input, "min-h-10 w-auto py-1.5")} value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Not published</option>
              <option value="registered">Registered with FEDCOOP</option>
              <option value="unverified">Unverified</option>
            </select>
            <span className="text-[0.9rem] text-ink-muted">{shown.length} shown</span>
          </div>
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Society</th>
                  <th className={table.th}>State</th>
                  <th className={table.th}>Registered</th>
                  <th className={table.th}>Verified</th>
                  <th className={table.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {shown.slice(0, limit).map((c) => (
                  <tr key={c._id} className={table.row}>
                    <td className={table.td}>
                      <Link href={`/admin/cooperatives/${c._id}`} className="font-bold hover:text-cord">
                        {c.name}
                      </Link>
                      <p className="text-[0.82rem] text-ink-muted">
                        {c.mda}
                        {c.isTestData && " · test data"}
                      </p>
                    </td>
                    <td className={`${table.td} text-ink-muted`}>{stateByCode(c.stateCode)?.name ?? c.stateCode}</td>
                    <td className={table.td}>
                      <FlagButton on={c.isRegistered} onClick={() => run(() => setFlag({ id: c._id, flag: "isRegistered", value: !c.isRegistered }))} />
                    </td>
                    <td className={table.td}>
                      <FlagButton on={c.isVerified} onClick={() => run(() => setFlag({ id: c._id, flag: "isVerified", value: !c.isVerified }))} />
                    </td>
                    <td className={table.td}>
                      <button type="button" onClick={() => run(() => setFlag({ id: c._id, flag: "isPublished", value: !c.isPublished }))} title="Toggle published">
                        <Status on={c.isPublished} onLabel="Published" offLabel="Hidden" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {shown.length > limit && (
            <div className="mt-4 flex justify-center">
              <Button variant="secondary" onClick={() => setLimit(limit + PAGE * 2)}>
                Show more ({shown.length - limit} remaining)
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}

function FlagButton({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[0.78rem] font-bold transition-colors",
        on ? "bg-cord-soft text-cord" : "bg-paper text-ink-muted ring-1 ring-cord-line hover:text-ink",
      )}
    >
      {on ? "Yes" : "No"}
    </button>
  );
}
