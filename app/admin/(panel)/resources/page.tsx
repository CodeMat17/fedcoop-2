"use client";

import { useMutation, useQuery } from "convex/react";
import { FileText, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dropzone } from "@/components/admin/Media";
import { ConfirmButton, Empty, Field, Loading, PageHead, Panel, PillarPicker, Status, Toggle, errorMessage, opt, table, useRun } from "@/components/admin/ui";
import { useCloudinaryUpload } from "@/components/admin/upload";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { fmtBytes, fmtDate } from "@/lib/format";

type Draft = {
  id?: Doc<"resources">["_id"];
  title: string;
  description: string;
  category: string;
  pillars: string[];
  fileUrl: string;
  fileType: string;
  fileSize: number;
  fileName?: string;
  isPublished: boolean;
};

const blank: Draft = { title: "", description: "", category: "", pillars: [], fileUrl: "", fileType: "", fileSize: 0, isPublished: true };

export default function ResourcesAdmin() {
  const rows = useQuery(api.admin.resources.list);
  const remove = useMutation(api.admin.resources.remove);
  const { run } = useRun();
  const [draft, setDraft] = useState<Draft | null>(null);
  const categories = Array.from(new Set(rows?.map((r) => r.category) ?? [])).sort();

  return (
    <>
      <PageHead
        title="Resources"
        description="Downloadable documents for /resources: bye-laws, forms, guides. Files are stored on Cloudinary."
        actions={
          <Button onClick={() => setDraft(blank)}>
            <Plus aria-hidden="true" /> Add resource
          </Button>
        }
      />
      {draft && <ResourceForm key={draft.id ?? "new"} initial={draft} categories={categories} onDone={() => setDraft(null)} />}
      {!rows ? (
        <Loading />
      ) : rows.length === 0 ? (
        !draft && <Empty title="No resources yet" action={<Button onClick={() => setDraft(blank)}>Add the first document</Button>} />
      ) : (
        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Document</th>
                <th className={table.th}>Category</th>
                <th className={table.th}>File</th>
                <th className={table.th}>Status</th>
                <th className={table.th}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className={table.row}>
                  <td className={table.td}>
                    <p className="font-bold">{r.title}</p>
                    <p className="text-[0.82rem] text-ink-muted">Updated {fmtDate(r.updatedAt)}</p>
                  </td>
                  <td className={table.td}>{r.category}</td>
                  <td className={table.td}>
                    <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-cord hover:underline">
                      {r.fileType} · {fmtBytes(r.fileSize)}
                    </a>
                  </td>
                  <td className={table.td}>
                    <Status on={r.isPublished} />
                  </td>
                  <td className={`${table.td} text-right whitespace-nowrap`}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setDraft({
                          id: r._id,
                          title: r.title,
                          description: r.description ?? "",
                          category: r.category,
                          pillars: r.pillars ?? [],
                          fileUrl: r.fileUrl,
                          fileType: r.fileType,
                          fileSize: r.fileSize,
                          isPublished: r.isPublished,
                        })
                      }
                    >
                      Edit
                    </Button>
                    <ConfirmButton onConfirm={() => run(() => remove({ id: r._id }), "Resource deleted")} />
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

function ResourceForm({ initial, categories, onDone }: { initial: Draft; categories: string[]; onDone: () => void }) {
  const save = useMutation(api.admin.resources.save);
  const upload = useCloudinaryUpload("resources");
  const { run, pending } = useRun();
  const [f, setF] = useState(initial);
  const [progress, setProgress] = useState<number | null>(null);
  const set = (patch: Partial<Draft>) => setF((prev) => ({ ...prev, ...patch }));

  async function handle(files: File[]) {
    const file = files[0];
    setProgress(0);
    try {
      const res = await upload(file, { kind: "any", onProgress: setProgress });
      const ext = (res.format ?? file.name.split(".").pop() ?? "file").toUpperCase();
      set({
        fileUrl: res.url,
        fileSize: res.bytes,
        fileType: ext,
        fileName: file.name,
        title: f.title || file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
      });
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setProgress(null);
    }
  }

  return (
    <Panel title={initial.id ? "Edit resource" : "New resource"} className="mb-8">
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const saved = await run(
            () =>
              save({
                id: f.id,
                title: f.title,
                description: opt(f.description),
                category: f.category.trim(),
                pillars: f.pillars.length ? f.pillars : undefined,
                fileUrl: f.fileUrl,
                fileType: f.fileType,
                fileSize: f.fileSize,
                isPublished: f.isPublished,
              }),
            "Resource saved",
          );
          if (saved) onDone();
        }}
      >
        <div className="md:col-span-2">
          <Dropzone onFiles={handle} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,image/*" busy={progress !== null}>
            {progress !== null ? (
              `Uploading… ${progress}%`
            ) : f.fileUrl ? (
              <span className="inline-flex items-center gap-2 font-semibold text-ink">
                <FileText className="size-4" aria-hidden="true" /> {f.fileName ?? f.fileType} · {fmtBytes(f.fileSize)}. Drop a new file to replace it, or
              </span>
            ) : (
              "Drop the document here (PDF, Word, Excel, PowerPoint), or"
            )}
          </Dropzone>
        </div>
        <Field label="Title" htmlFor="r-title" required>
          <Input id="r-title" value={f.title} onChange={(e) => set({ title: e.target.value })} required />
        </Field>
        <Field label="Category" htmlFor="r-category" required hint="Pick an existing category or type a new one.">
          <Input id="r-category" list="r-categories" value={f.category} onChange={(e) => set({ category: e.target.value })} required />
          <datalist id="r-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Description" htmlFor="r-description" className="md:col-span-2">
          <Textarea id="r-description" rows={2} value={f.description} onChange={(e) => set({ description: e.target.value })} />
        </Field>
        <Field label="Pillars" className="md:col-span-2">
          <PillarPicker value={f.pillars} onChange={(pillars) => set({ pillars })} />
        </Field>
        <div className="md:col-span-2">
          <Toggle checked={f.isPublished} onChange={(isPublished) => set({ isPublished })} label="Published" />
        </div>
        <div className="flex gap-2 md:col-span-2">
          <Button type="submit" disabled={pending || progress !== null || !f.fileUrl}>
            Save resource
          </Button>
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </form>
    </Panel>
  );
}
