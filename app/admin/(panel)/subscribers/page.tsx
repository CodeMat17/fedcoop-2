"use client";

import { useMutation, useQuery } from "convex/react";
import { Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmButton, Empty, Loading, PageHead, SearchBox, table, useRun } from "@/components/admin/ui";
import { api } from "@/convex/_generated/api";
import { fmtDate } from "@/lib/format";

export default function SubscribersAdmin() {
  const rows = useQuery(api.admin.inbox.subscribers);
  const remove = useMutation(api.admin.inbox.removeSubscriber);
  const { run } = useRun();
  const [q, setQ] = useState("");
  const shown = rows?.filter((r) => r.email.includes(q.trim().toLowerCase()));

  return (
    <>
      <PageHead
        title="Subscribers"
        description={rows ? `${rows.length} newsletter sign-up${rows.length === 1 ? "" : "s"} from the site footer.` : undefined}
        actions={
          rows && rows.length > 0 ? (
            <Button
              variant="secondary"
              onClick={() => navigator.clipboard.writeText(rows.map((r) => r.email).join("\n")).then(() => toast.success(`${rows.length} emails copied`))}
            >
              <Copy aria-hidden="true" /> Copy all emails
            </Button>
          ) : undefined
        }
      />
      {!shown ? (
        <Loading />
      ) : rows!.length === 0 ? (
        <Empty title="No subscribers yet" />
      ) : (
        <>
          <div className="mb-4">
            <SearchBox value={q} onChange={setQ} placeholder="Search emails" />
          </div>
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Email</th>
                  <th className={table.th}>Signed up</th>
                  <th className={table.th}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r._id} className={table.row}>
                    <td className={`${table.td} font-semibold`}>{r.email}</td>
                    <td className={`${table.td} text-ink-muted`}>{fmtDate(r.createdAt)}</td>
                    <td className={`${table.td} text-right`}>
                      <ConfirmButton label="Remove" confirmLabel="Confirm" onConfirm={() => run(() => remove({ id: r._id }), "Subscriber removed")} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
