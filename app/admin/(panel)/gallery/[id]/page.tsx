"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { ChevronLeft, ChevronRight, ExternalLink, GripVertical, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dropzone } from "@/components/admin/Media";
import { ConfirmButton, Empty, Field, Loading, PageHead, Panel, Toggle, errorMessage, fromDateInput, opt, slugInput, toDateInput, useRun } from "@/components/admin/ui";
import { thumb, useCloudinaryUpload } from "@/components/admin/upload";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { slugify } from "@/convex/slug";
import { currentTime } from "@/lib/format";
import { GALLERY_CATEGORIES } from "@/lib/site";
import { btn, card, cn, input } from "@/lib/ui";

export default function EditAlbum() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const data = useQuery(api.admin.albums.get, isNew ? "skip" : { id });

  if (!isNew && data === undefined) return <Loading />;
  if (!isNew && data === null) return <Empty title="Album not found">It may have been deleted.</Empty>;
  return (
    <>
      <AlbumForm key={data?.album._id ?? "new"} initial={data?.album} photoCount={data?.photos.length ?? 0} />
      {data && <Photos album={data.album} photos={data.photos} />}
    </>
  );
}

function AlbumForm({ initial, photoCount }: { initial?: Doc<"albums">; photoCount: number }) {
  const router = useRouter();
  const save = useMutation(api.admin.albums.save);
  const setPublished = useMutation(api.admin.albums.setPublished);
  const remove = useMutation(api.admin.albums.remove);
  const { run, pending } = useRun();
  const [f, setF] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? GALLERY_CATEGORIES[0],
    date: initial?.date ?? currentTime(),
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const set = (patch: Partial<typeof f>) => setF((prev) => ({ ...prev, ...patch }));

  async function submit() {
    const id = await run(
      () => save({ id: initial?._id, ...f, description: opt(f.description), isPublished: initial?.isPublished ?? false }),
      initial ? "Album saved" : "Album created. Now add photos.",
    );
    if (id && !initial) router.replace(`/admin/gallery/${id}`);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <PageHead
        title={initial ? initial.title || "Album" : "New album"}
        back={{ href: "/admin/gallery", label: "All albums" }}
        actions={
          <>
            {initial?.isPublished && (
              <a href={`/gallery/${initial.slug}`} target="_blank" rel="noreferrer" className={btn.ghost}>
                View live <ExternalLink aria-hidden="true" />
              </a>
            )}
            {initial && (
              <ConfirmButton
                size="default"
                label={`Delete album${photoCount ? ` and ${photoCount} photos` : ""}`}
                onConfirm={async () => {
                  const done = await run(() => remove({ id: initial._id }), "Album deleted");
                  if (done !== undefined) router.replace("/admin/gallery");
                }}
              />
            )}
            <Button type="submit" variant="secondary" disabled={pending}>
              {initial ? "Save details" : "Create album"}
            </Button>
          </>
        }
      />
      <Panel>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title" htmlFor="title" required>
            <Input
              id="title"
              value={f.title}
              onChange={(e) => set({ title: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })}
              required
            />
          </Field>
          <Field label="URL slug" htmlFor="slug" hint={`/gallery/${f.slug || "…"}`}>
            <Input
              id="slug"
              value={f.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set({ slug: slugInput(e.target.value) });
              }}
            />
          </Field>
          <Field label="Category" htmlFor="category">
            <select id="category" className={input} value={f.category} onChange={(e) => set({ category: e.target.value })}>
              {GALLERY_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Date" htmlFor="date">
            <Input id="date" type="date" value={toDateInput(f.date)} onChange={(e) => set({ date: fromDateInput(e.target.value) ?? Date.now() })} />
          </Field>
          <Field label="Description" htmlFor="description" className="md:col-span-2">
            <Textarea id="description" rows={2} value={f.description} onChange={(e) => set({ description: e.target.value })} />
          </Field>
          {initial && (
            <div className="md:col-span-2">
              <Toggle
                checked={initial.isPublished}
                onChange={(isPublished) =>
                  run(() => setPublished({ id: initial._id, isPublished }), isPublished ? "Album published" : "Album unpublished")
                }
                label="Published"
                description="Blocked while any photo is missing alt text."
              />
            </div>
          )}
        </div>
      </Panel>
    </form>
  );
}

function Photos({ album, photos }: { album: Doc<"albums">; photos: Doc<"photos">[] }) {
  const upload = useCloudinaryUpload("gallery");
  const addPhotos = useMutation(api.admin.albums.addPhotos);
  const reorder = useMutation(api.admin.albums.reorder);
  const { run } = useRun();
  const [status, setStatus] = useState<string | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  const sorted = [...photos].sort((a, b) => a.order - b.order);

  async function handle(files: File[]) {
    let done = 0;
    let failed = 0;
    for (const file of files) {
      setStatus(`Uploading ${done + failed + 1} of ${files.length}…`);
      try {
        const res = await upload(file, { blur: true });
        await addPhotos({
          albumId: album._id,
          photos: [
            {
              publicId: res.publicId,
              width: res.width ?? 0,
              height: res.height ?? 0,
              blurDataUrl: res.blurDataUrl,
              alt: "",
              category: album.category,
            },
          ],
        });
        done++;
      } catch (error) {
        failed++;
        toast.error(errorMessage(error));
      }
    }
    setStatus(null);
    if (done) toast.success(`${done} photo${done === 1 ? "" : "s"} added. Add alt text to each before publishing.`);
    if (failed) toast.error(`${failed} upload${failed === 1 ? "" : "s"} failed.`);
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= sorted.length || from === to) return;
    const ids = sorted.map((p) => p._id);
    const [moved] = ids.splice(from, 1);
    ids.splice(to, 0, moved);
    void run(() => reorder({ albumId: album._id, ids }));
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[1.25rem] font-black tracking-[-0.02em]">Photos ({sorted.length})</h2>
          <p className="text-[0.9rem] text-ink-muted">
            Drag to reorder. Star up to four photos for the album cover. Alt text saves when you leave the field.
          </p>
        </div>
      </div>
      <Dropzone onFiles={handle} multiple busy={status !== null} className="mb-6">
        {status ?? "Drag photos here (JPEG, PNG or WebP, up to 10 MB each), or"}
      </Dropzone>
      {sorted.length === 0 ? (
        <Empty title="No photos in this album yet" />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((p, i) => (
            <li
              key={p._id}
              draggable
              onDragStart={(e) => {
                setDragging(i);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragging !== null) move(dragging, i);
                setDragging(null);
              }}
              onDragEnd={() => setDragging(null)}
              className={cn(dragging === i && "opacity-40")}
            >
              <PhotoCard
                photo={p}
                albumId={album._id}
                isCover={album.coverPhotoIds.includes(p._id)}
                onMove={(dir) => move(i, i + dir)}
                first={i === 0}
                last={i === sorted.length - 1}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function PhotoCard({
  photo,
  albumId,
  isCover,
  onMove,
  first,
  last,
}: {
  photo: Doc<"photos">;
  albumId: Id<"albums">;
  isCover: boolean;
  onMove: (dir: -1 | 1) => void;
  first: boolean;
  last: boolean;
}) {
  const update = useMutation(api.admin.albums.updatePhoto);
  const toggleCover = useMutation(api.admin.albums.toggleCover);
  const remove = useMutation(api.admin.albums.removePhoto);
  const { run } = useRun();
  const [alt, setAlt] = useState(photo.alt);
  const [caption, setCaption] = useState(photo.caption ?? "");

  function commit(patch: { alt?: string; caption?: string; category?: string }) {
    const next = { alt, caption: opt(caption), category: photo.category, ...patch };
    if (next.alt === photo.alt && next.caption === photo.caption && next.category === photo.category) return;
    void run(() => update({ id: photo._id, ...next, caption: opt(next.caption) }), "Photo saved");
  }

  return (
    <div className={cn(card, "overflow-hidden", !photo.alt.trim() && "border-brass")}>
      <div className="relative aspect-[4/3] bg-cord-soft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumb(photo.publicId, 640)} alt={photo.alt} className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent p-2 text-white">
          <GripVertical className="size-5 cursor-grab" aria-hidden="true" />
          <button
            type="button"
            onClick={() => run(() => toggleCover({ albumId, photoId: photo._id }))}
            aria-pressed={isCover}
            aria-label={isCover ? "Remove from album cover" : "Use on album cover"}
            className="grid size-9 place-items-center rounded-full hover:bg-white/20"
          >
            <Star className={cn("size-5", isCover && "fill-brass text-brass")} />
          </button>
        </div>
      </div>
      <div className="space-y-3 p-3">
        <div>
          <label className="mb-1 block text-[0.8rem] font-bold" htmlFor={`alt-${photo._id}`}>
            Alt text <span className="text-danger">*</span>
          </label>
          <Input
            id={`alt-${photo._id}`}
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            onBlur={() => commit({ alt: alt.trim() })}
            placeholder="What does the photo show?"
            aria-invalid={!alt.trim()}
            className="min-h-9 text-[0.9rem]"
          />
        </div>
        <Input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onBlur={() => commit({ caption })}
          placeholder="Caption (optional)"
          aria-label="Caption"
          className="min-h-9 text-[0.9rem]"
        />
        <div className="flex items-center gap-1">
          <select
            aria-label="Category"
            className={cn(input, "min-h-9 flex-1 py-1 text-[0.88rem]")}
            value={photo.category ?? ""}
            onChange={(e) => commit({ category: e.target.value || undefined })}
          >
            <option value="">No category</option>
            {GALLERY_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <Button type="button" size="icon" variant="ghost" className="size-9" disabled={first} onClick={() => onMove(-1)} aria-label="Move earlier">
            <ChevronLeft />
          </Button>
          <Button type="button" size="icon" variant="ghost" className="size-9" disabled={last} onClick={() => onMove(1)} aria-label="Move later">
            <ChevronRight />
          </Button>
          <ConfirmButton
            label={<Trash2 aria-label="Delete photo" />}
            confirmLabel="Delete"
            onConfirm={() => run(() => remove({ id: photo._id }), "Photo deleted")}
          />
        </div>
      </div>
    </div>
  );
}
