"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmButton, Empty, Loading, PageHead, Status, table, useRun } from "@/components/admin/ui";
import { api } from "@/convex/_generated/api";
import { currentTime, fmtDate } from "@/lib/format";
import { btn } from "@/lib/ui";

export default function EventsAdmin() {
  const events = useQuery(api.admin.events.list);
  const setPublished = useMutation(api.admin.events.setPublished);
  const remove = useMutation(api.admin.events.remove);
  const { run } = useRun();
  const now = currentTime();

  return (
    <>
      <PageHead
        title="Events"
        description="AGMs, trainings and fora, with RSVP registrations."
        actions={
          <Link href="/admin/events/new" className={btn.primary}>
            <Plus aria-hidden="true" /> New event
          </Link>
        }
      />
      {!events ? (
        <Loading />
      ) : events.length === 0 ? (
        <Empty title="No events yet" action={<Link href="/admin/events/new" className={btn.primary}>Add an event</Link>} />
      ) : (
        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Event</th>
                <th className={table.th}>Date</th>
                <th className={table.th}>RSVPs</th>
                <th className={table.th}>Status</th>
                <th className={table.th}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e._id} className={table.row}>
                  <td className={table.td}>
                    <Link href={`/admin/events/${e._id}`} className="font-bold hover:text-cord">
                      {e.title}
                    </Link>
                    <p className="text-[0.82rem] text-ink-muted">
                      {[e.venue, e.city].filter(Boolean).join(", ")}
                      {e.startsAt < now && " · Past"}
                    </p>
                  </td>
                  <td className={`${table.td} whitespace-nowrap text-ink-muted`}>{fmtDate(e.startsAt)}</td>
                  <td className={table.td}>
                    {e.rsvpEnabled || e.rsvpCount ? (
                      <span>
                        {e.rsvpCount} <span className="text-ink-muted">({e.attendeeCount} people)</span>
                      </span>
                    ) : (
                      <span className="text-ink-muted">Off</span>
                    )}
                  </td>
                  <td className={table.td}>
                    <Status on={e.isPublished} />
                  </td>
                  <td className={`${table.td} text-right whitespace-nowrap`}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => run(() => setPublished({ id: e._id, isPublished: !e.isPublished }), e.isPublished ? "Unpublished" : "Published")}
                    >
                      {e.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                    <ConfirmButton onConfirm={() => run(() => remove({ id: e._id }), "Event and its RSVPs deleted")} />
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
