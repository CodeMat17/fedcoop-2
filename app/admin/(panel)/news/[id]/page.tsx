"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichEditor } from "@/components/admin/Editor";
import { ImageField } from "@/components/admin/Media";
import { Empty, Field, Loading, PageHead, Panel, PillarPicker, Toggle, fromDateInput, opt, slugInput, toDateInput, useRun } from "@/components/admin/ui";
import { useUnsavedWarning } from "@/components/admin/useUnsavedWarning";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { slugify } from "@/convex/slug";
import { currentTime } from "@/lib/format";
import { btn } from "@/lib/ui";

export default function EditPost() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const post = useQuery(api.admin.posts.get, isNew ? "skip" : { id });

  if (!isNew && post === undefined) return <Loading />;
  if (!isNew && post === null) return <Empty title="Article not found">It may have been deleted.</Empty>;
  return <PostForm key={post?._id ?? "new"} initial={post ?? undefined} />;
}

function PostForm({ initial }: { initial?: Doc<"posts"> }) {
  const router = useRouter();
  const save = useMutation(api.admin.posts.save);
  const { run, pending } = useRun();
  const [dirty, setDirty] = useState(false);
  useUnsavedWarning(dirty);

  const [f, setF] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    body: initial?.body ?? "",
    coverUrl: initial?.coverUrl,
    coverAlt: initial?.coverAlt ?? "",
    pillars: initial?.pillars ?? [],
    author: initial?.author ?? "",
    publishedAt: initial?.publishedAt ?? currentTime(),
    isPublished: initial?.isPublished ?? false,
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const set = (patch: Partial<typeof f>) => {
    setF((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  async function submit(isPublished = f.isPublished) {
    const id = await run(
      () =>
        save({
          id: initial?._id,
          ...f,
          isPublished,
          coverUrl: f.coverUrl,
          coverAlt: f.coverUrl ? opt(f.coverAlt) : undefined,
          author: opt(f.author),
        }),
      isPublished ? "Article saved and published" : "Draft saved",
    );
    if (!id) return;
    setDirty(false);
    setF((prev) => ({ ...prev, isPublished }));
    if (!initial) router.replace(`/admin/news/${id}`);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <PageHead
        title={initial ? "Edit article" : "New article"}
        back={{ href: "/admin/news", label: "All news" }}
        actions={
          <>
            {initial?.isPublished && (
              <a href={`/news/${initial.slug}`} target="_blank" rel="noreferrer" className={btn.ghost}>
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
          <Field label="Excerpt" htmlFor="excerpt" hint="One or two sentences for cards, search results and social previews." required>
            <Textarea id="excerpt" rows={3} value={f.excerpt} onChange={(e) => set({ excerpt: e.target.value })} maxLength={320} />
          </Field>
          <div>
            <p className="mb-1.5 text-[0.88rem] font-bold">Body</p>
            <RichEditor value={f.body} onChange={(body) => set({ body })} folder="news" label="Article body" />
          </div>
        </div>

        <aside className="space-y-5">
          <Panel title="Publishing">
            <div className="space-y-4">
              <Toggle
                checked={f.isPublished}
                onChange={(isPublished) => set({ isPublished })}
                label="Published"
                description="Visible on /news once saved."
              />
              <Field label="Date" htmlFor="date">
                <Input
                  id="date"
                  type="date"
                  value={toDateInput(f.publishedAt)}
                  onChange={(e) => set({ publishedAt: fromDateInput(e.target.value) ?? Date.now() })}
                />
              </Field>
              <Field label="Author" htmlFor="author" hint="Leave blank to credit FEDCOOP.">
                <Input id="author" value={f.author} onChange={(e) => set({ author: e.target.value })} />
              </Field>
              <Field label="URL slug" htmlFor="slug" hint={`/news/${f.slug || "…"}`}>
                <Input
                  id="slug"
                  value={f.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set({ slug: slugInput(e.target.value) });
                  }}
                />
              </Field>
            </div>
          </Panel>
          <Panel title="Cover image">
            <ImageField
              folder="news"
              value={f.coverUrl}
              onChange={(coverUrl) => set({ coverUrl })}
              alt={f.coverAlt}
              onAltChange={(coverAlt) => set({ coverAlt })}
            />
          </Panel>
          <Panel title="Pillars" description="Used for filtering and related articles.">
            <PillarPicker value={f.pillars} onChange={(pillars) => set({ pillars })} />
          </Panel>
        </aside>
      </div>
    </form>
  );
}
