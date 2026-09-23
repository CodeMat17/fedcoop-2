"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichEditor } from "@/components/admin/Editor";
import { ImageField } from "@/components/admin/Media";
import {
  ConfirmButton,
  Empty,
  Field,
  Loading,
  PageHead,
  Panel,
  PillarPicker,
  Toggle,
  fromLocalInput,
  slugInput,
  table,
  toLocalInput,
  useRun,
} from "@/components/admin/ui";
import { useUnsavedWarning } from "@/components/admin/useUnsavedWarning";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { slugify } from "@/convex/slug";
import { fmtDate } from "@/lib/format";
import { btn, input } from "@/lib/ui";

export default function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const event = useQuery(api.admin.events.get, isNew ? "skip" : { id });

  if (!isNew && event === undefined) return <Loading />;
  if (!isNew && event === null) return <Empty title="Event not found">It may have been deleted.</Empty>;
  return (
    <>
      <EventForm key={event?._id ?? "new"} initial={event ?? undefined} />
      {event && <Rsvps eventId={event._id} />}
    </>
  );
}

function EventForm({ initial }: { initial?: Doc<"events"> }) {
  const router = useRouter();
  const save = useMutation(api.admin.events.save);
  const albums = useQuery(api.admin.albums.list);
  const { run, pending } = useRun();
  const [dirty, setDirty] = useState(false);
  useUnsavedWarning(dirty);

  const [f, setF] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    summary: initial?.summary ?? "",
    body: initial?.body ?? "",
    startsAt: initial?.startsAt,
    endsAt: initial?.endsAt,
    venue: initial?.venue ?? "",
    city: initial?.city ?? "",
    coverUrl: initial?.coverUrl,
    pillars: initial?.pillars ?? [],
    albumId: initial?.albumId,
    rsvpEnabled: initial?.rsvpEnabled ?? false,
    isPublished: initial?.isPublished ?? false,
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const set = (patch: Partial<typeof f>) => {
    setF((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  async function submit(isPublished = f.isPublished) {
    if (!f.startsAt) {
      toast.error("Set when the event starts.");
      return;
    }
    const startsAt = f.startsAt;
    const id = await run(
      () => save({ id: initial?._id, ...f, startsAt, isPublished }),
      isPublished ? "Event saved and published" : "Draft saved",
    );
    if (!id) return;
    setDirty(false);
    setF((prev) => ({ ...prev, isPublished }));
    if (!initial) router.replace(`/admin/events/${id}`);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <PageHead
        title={initial ? "Edit event" : "New event"}
        back={{ href: "/admin/events", label: "All events" }}
        actions={
          <>
            {initial?.isPublished && (
              <a href={`/events/${initial.slug}`} target="_blank" rel="noreferrer" className={btn.ghost}>
                View live <ExternalLink aria-hidden="true" />
              </a>
            )}
            <Button type="submit" variant="secondary" disabled={pending}>
              {f.isPublished ? "Save changes" : "Save draft"}
            </Button>
            {!f.isPublished && (
              <Button type="button" disabled={pending} onClick={() => void submit(true)}>
                Publish
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <Field label="Title" htmlFor="title" required>
            <Input
              id="title"
              value={f.title}
              onChange={(e) => set({ title: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })}
              className="text-[1.15rem] font-bold"
              required
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Starts" htmlFor="starts" required>
              <Input
                id="starts"
                type="datetime-local"
                value={toLocalInput(f.startsAt)}
                onChange={(e) => set({ startsAt: fromLocalInput(e.target.value) })}
                required
              />
            </Field>
            <Field label="Ends" htmlFor="ends">
              <Input id="ends" type="datetime-local" value={toLocalInput(f.endsAt)} onChange={(e) => set({ endsAt: fromLocalInput(e.target.value) })} />
            </Field>
            <Field label="Venue" htmlFor="venue" required>
              <Input id="venue" value={f.venue} onChange={(e) => set({ venue: e.target.value })} />
            </Field>
            <Field label="City" htmlFor="city" required>
              <Input id="city" value={f.city} onChange={(e) => set({ city: e.target.value })} />
            </Field>
          </div>
          <Field label="Summary" htmlFor="summary" hint="Shown on event cards." required>
            <Textarea id="summary" rows={3} value={f.summary} onChange={(e) => set({ summary: e.target.value })} maxLength={320} />
          </Field>
          <div>
            <p className="mb-1.5 text-[0.88rem] font-bold">Details</p>
            <RichEditor value={f.body} onChange={(body) => set({ body })} folder="events" label="Event details" />
          </div>
        </div>

        <aside className="space-y-5">
          <Panel title="Publishing">
            <div className="space-y-4">
              <Toggle checked={f.isPublished} onChange={(isPublished) => set({ isPublished })} label="Published" />
              <Toggle
                checked={f.rsvpEnabled}
                onChange={(rsvpEnabled) => set({ rsvpEnabled })}
                label="Accept RSVPs"
                description="Shows the registration form on the event page."
              />
              <Field label="URL slug" htmlFor="slug" hint={`/events/${f.slug || "…"}`}>
                <Input
                  id="slug"
                  value={f.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set({ slug: slugInput(e.target.value) });
                  }}
                />
              </Field>
              <Field label="Photo album" htmlFor="album" hint="Links the event to its gallery album.">
                <select
                  id="album"
                  className={input}
                  value={f.albumId ?? ""}
                  onChange={(e) => set({ albumId: (e.target.value || undefined) as Id<"albums"> | undefined })}
                >
                  <option value="">None</option>
                  {albums?.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.title}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Panel>
          <Panel title="Cover image">
            <ImageField folder="events" value={f.coverUrl} onChange={(coverUrl) => set({ coverUrl })} />
          </Panel>
          <Panel title="Pillars">
            <PillarPicker value={f.pillars} onChange={(pillars) => set({ pillars })} />
          </Panel>
        </aside>
      </div>
    </form>
  );
}

function Rsvps({ eventId }: { eventId: Id<"events"> }) {
  const rows = useQuery(api.admin.events.rsvps, { eventId });
  const remove = useMutation(api.admin.events.removeRsvp);
  const { run } = useRun();

  function copyCsv() {
    if (!rows) return;
    const esc = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`;
    const csv = [
      ["Name", "Cooperative", "Email", "Phone", "Attendees", "Registered"],
      ...rows.map((r) => [r.name, r.cooperative, r.email, r.phone, r.attendees, new Date(r.createdAt).toISOString()]),
    ]
      .map((line) => line.map(esc).join(","))
      .join("\n");
    void navigator.clipboard.writeText(csv).then(() => toast.success("RSVPs copied as CSV"));
  }

  return (
    <Panel
      className="mt-10"
      title={`RSVPs${rows ? ` (${rows.length}, ${rows.reduce((n, r) => n + r.attendees, 0)} people)` : ""}`}
      actions={
        rows && rows.length > 0 ? (
          <Button size="sm" variant="secondary" onClick={copyCsv}>
            <Copy aria-hidden="true" /> Copy CSV
          </Button>
        ) : undefined
      }
    >
      {!rows ? (
        <Loading />
      ) : rows.length === 0 ? (
        <p className="text-ink-muted">No registrations yet.</p>
      ) : (
        <div className="-mx-5 overflow-x-auto md:-mx-6">
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Name</th>
                <th className={table.th}>Cooperative</th>
                <th className={table.th}>Contact</th>
                <th className={table.th}>People</th>
                <th className={table.th}>Registered</th>
                <th className={table.th}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className={table.row}>
                  <td className={`${table.td} font-bold`}>{r.name}</td>
                  <td className={table.td}>{r.cooperative}</td>
                  <td className={table.td}>
                    <a href={`mailto:${r.email}`} className="text-cord hover:underline">
                      {r.email}
                    </a>
                    <p className="text-[0.85rem] text-ink-muted">{r.phone}</p>
                  </td>
                  <td className={table.td}>{r.attendees}</td>
                  <td className={`${table.td} whitespace-nowrap text-ink-muted`}>{fmtDate(r.createdAt)}</td>
                  <td className={`${table.td} text-right`}>
                    <ConfirmButton label="Remove" confirmLabel="Confirm" onConfirm={() => run(() => remove({ id: r._id }), "RSVP removed")} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
