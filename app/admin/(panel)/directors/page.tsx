"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowDown, ArrowUp, Plus, UserRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageField } from "@/components/admin/Media";
import { ConfirmButton, Empty, Field, Loading, PageHead, Panel, Status, Toggle, opt, useRun } from "@/components/admin/ui";
import { thumb } from "@/components/admin/upload";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { card, cn } from "@/lib/ui";

type Draft = {
  id?: Id<"directors">;
  name: string;
  office: string;
  cooperative: string;
  mda: string;
  bio: string;
  photoUrl?: string;
  isExecutive: boolean;
  isPublished: boolean;
};

const blank: Draft = { name: "", office: "", cooperative: "", mda: "", bio: "", isExecutive: false, isPublished: true };

const toDraft = (d: Doc<"directors">): Draft => ({
  id: d._id,
  name: d.name,
  office: d.office,
  cooperative: d.cooperative ?? "",
  mda: d.mda ?? "",
  bio: d.bio ?? "",
  photoUrl: d.photoUrl,
  isExecutive: d.isExecutive,
  isPublished: d.isPublished,
});

export default function DirectorsAdmin() {
  const rows = useQuery(api.admin.directors.list);
  const reorder = useMutation(api.admin.directors.reorder);
  const remove = useMutation(api.admin.directors.remove);
  const { run } = useRun();
  const [draft, setDraft] = useState<Draft | null>(null);

  function move(from: number, to: number) {
    if (!rows || to < 0 || to >= rows.length) return;
    const ids = rows.map((r) => r._id);
    const [moved] = ids.splice(from, 1);
    ids.splice(to, 0, moved);
    void run(() => reorder({ ids }));
  }

  return (
    <>
      <PageHead
        title="Directors"
        description="The board shown on /directors, in this order. Executives appear first on the page."
        actions={
          <Button onClick={() => setDraft(blank)}>
            <Plus aria-hidden="true" /> Add director
          </Button>
        }
      />
      {draft && <DirectorForm key={draft.id ?? "new"} initial={draft} onDone={() => setDraft(null)} />}
      {!rows ? (
        <Loading />
      ) : rows.length === 0 ? (
        !draft && <Empty title="No directors yet" />
      ) : (
        <ul className="space-y-2">
          {rows.map((d, i) => (
            <li key={d._id} className={cn(card, "flex items-center gap-4 p-3")}>
              <div className="relative size-14 shrink-0 overflow-hidden rounded-full bg-cord-soft">
                {d.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb(d.photoUrl, 160)} alt="" className="size-full object-cover" />
                ) : (
                  <UserRound className="absolute top-1/2 left-1/2 size-6 -translate-1/2 text-cord/50" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{d.name}</p>
                <p className="truncate text-[0.85rem] text-ink-muted">
                  {d.office}
                  {d.isExecutive && " · Executive"}
                  {d.mda && ` · ${d.mda}`}
                </p>
              </div>
              <Status on={d.isPublished} onLabel="Shown" offLabel="Hidden" />
              <div className="flex items-center">
                <Button size="icon" variant="ghost" className="size-9" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label={`Move ${d.name} up`}>
                  <ArrowUp />
                </Button>
                <Button size="icon" variant="ghost" className="size-9" disabled={i === rows.length - 1} onClick={() => move(i, i + 1)} aria-label={`Move ${d.name} down`}>
                  <ArrowDown />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setDraft(toDraft(d))}>
                  Edit
                </Button>
                <ConfirmButton onConfirm={() => run(() => remove({ id: d._id }), "Director removed")} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function DirectorForm({ initial, onDone }: { initial: Draft; onDone: () => void }) {
  const save = useMutation(api.admin.directors.save);
  const { run, pending } = useRun();
  const [f, setF] = useState(initial);
  const set = (patch: Partial<Draft>) => setF((prev) => ({ ...prev, ...patch }));

  return (
    <Panel title={initial.id ? `Edit ${initial.name}` : "New director"} className="mb-8">
      <form
        className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]"
        onSubmit={async (e) => {
          e.preventDefault();
          const saved = await run(
            () =>
              save({
                id: f.id,
                name: f.name.trim(),
                office: f.office.trim(),
                cooperative: opt(f.cooperative),
                mda: opt(f.mda),
                bio: opt(f.bio),
                photoUrl: f.photoUrl,
                isExecutive: f.isExecutive,
                isPublished: f.isPublished,
              }),
            "Director saved",
          );
          if (saved) onDone();
        }}
      >
        <div>
          <p className="mb-1.5 text-[0.88rem] font-bold">Portrait</p>
          <ImageField folder="directors" value={f.photoUrl} onChange={(photoUrl) => set({ photoUrl })} aspect="aspect-[4/5]" />
        </div>
        <div className="grid content-start gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="d-name" required>
            <Input id="d-name" value={f.name} onChange={(e) => set({ name: e.target.value })} required />
          </Field>
          <Field label="Office" htmlFor="d-office" required>
            <Input id="d-office" value={f.office} onChange={(e) => set({ office: e.target.value })} placeholder="e.g. National President" required />
          </Field>
          <Field label="Cooperative" htmlFor="d-coop">
            <Input id="d-coop" value={f.cooperative} onChange={(e) => set({ cooperative: e.target.value })} />
          </Field>
          <Field label="MDA" htmlFor="d-mda">
            <Input id="d-mda" value={f.mda} onChange={(e) => set({ mda: e.target.value })} />
          </Field>
          <Field label="Biography" htmlFor="d-bio" className="sm:col-span-2">
            <Textarea id="d-bio" rows={4} value={f.bio} onChange={(e) => set({ bio: e.target.value })} />
          </Field>
          <Toggle checked={f.isExecutive} onChange={(isExecutive) => set({ isExecutive })} label="Executive" description="National executive officer." />
          <Toggle checked={f.isPublished} onChange={(isPublished) => set({ isPublished })} label="Shown on the site" />
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={pending}>
              Save director
            </Button>
            <Button type="button" variant="ghost" onClick={onDone}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </Panel>
  );
}
