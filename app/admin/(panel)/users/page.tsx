"use client";

import { useMutation, useQuery } from "convex/react";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmButton, Loading, PageHead, Status, table, useRun } from "@/components/admin/ui";
import { api } from "@/convex/_generated/api";
import { fmtDate } from "@/lib/format";

/*
 * Clerk handles sign-in; the role stored here decides access. Anyone who has
 * signed in to /admin appears in this list, with no role until an admin grants it.
 */
export default function UsersAdmin() {
  const rows = useQuery(api.users.list);
  const setRole = useMutation(api.users.setRole);
  const remove = useMutation(api.users.remove);
  const { run, pending } = useRun();

  return (
    <>
      <PageHead
        title="Users"
        description="People who have signed in to the admin. Only accounts with the admin role can open it; everyone else sees a no-access page."
      />
      {!rows ? (
        <Loading />
      ) : (
        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Account</th>
                <th className={table.th}>Last seen</th>
                <th className={table.th}>Role</th>
                <th className={table.th}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u._id} className={table.row}>
                  <td className={table.td}>
                    <div className="flex items-center gap-3">
                      <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-cord-soft">
                        {u.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.imageUrl} alt="" className="size-full object-cover" />
                        ) : (
                          <UserRound className="size-4 text-cord" aria-hidden="true" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold">
                          {u.name ?? u.email ?? "Unnamed account"}
                          {u.isSelf && <span className="font-normal text-ink-muted"> (you)</span>}
                        </p>
                        {u.name && u.email && <p className="text-[0.85rem] text-ink-muted">{u.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className={`${table.td} text-ink-muted`}>{fmtDate(u.lastSeenAt)}</td>
                  <td className={table.td}>
                    <Status on={u.role === "admin"} onLabel="Admin" offLabel="No access" />
                  </td>
                  <td className={`${table.td} text-right whitespace-nowrap`}>
                    {!u.isSelf &&
                      (u.role === "admin" ? (
                        <ConfirmButton
                          label="Revoke admin"
                          confirmLabel="Confirm revoke"
                          disabled={pending}
                          onConfirm={() => run(() => setRole({ userId: u._id, role: null }), "Admin role removed")}
                        />
                      ) : (
                        <Button size="sm" variant="secondary" disabled={pending} onClick={() => run(() => setRole({ userId: u._id, role: "admin" }), "Admin role granted")}>
                          Make admin
                        </Button>
                      ))}
                    {!u.isSelf && u.role !== "admin" && (
                      <ConfirmButton label="Remove" confirmLabel="Confirm" onConfirm={() => run(() => remove({ userId: u._id }), "Account removed from the list")} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
