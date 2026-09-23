"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichEditor } from "@/components/admin/Editor";
import { Empty, Field, Loading, PageHead, useRun } from "@/components/admin/ui";
import { useUnsavedWarning } from "@/components/admin/useUnsavedWarning";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { PAGE_BLOCKS } from "@/components/admin/pageBlocks";

export default function EditPage() {
  const { key } = useParams<{ key: string }>();
  const block = PAGE_BLOCKS.find((b) => b.key === key);
  const row = useQuery(api.admin.pages.get, block ? { key } : "skip");

  if (!block) return <Empty title="Unknown page block" />;
  if (row === undefined) return <Loading />;
  return <PageForm key={row?._id ?? key} blockKey={key} fallbackTitle={block.title} where={block.where} initial={row ?? undefined} />;
}

function PageForm({ blockKey, fallbackTitle, where, initial }: { blockKey: string; fallbackTitle: string; where: string; initial?: Doc<"pages"> }) {
  const save = useMutation(api.admin.pages.save);
  const { run, pending } = useRun();
  const [title, setTitle] = useState(initial?.title ?? fallbackTitle);
  const [body, setBody] = useState(initial?.body ?? "");
  const [dirty, setDirty] = useState(false);
  useUnsavedWarning(dirty);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const ok = await run(() => save({ key: blockKey, title, body }), "Page saved");
        if (ok !== undefined) setDirty(false);
      }}
    >
      <PageHead
        title={fallbackTitle}
        description={`Appears on ${where}.`}
        back={{ href: "/admin/pages", label: "All pages" }}
        actions={
          <Button type="submit" disabled={pending}>
            Save
          </Button>
        }
      />
      <div className="max-w-4xl space-y-5">
        <Field label="Heading" htmlFor="title" required>
          <Input
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setDirty(true);
            }}
          />
        </Field>
        <div>
          <p className="mb-1.5 text-[0.88rem] font-bold">Text</p>
          <RichEditor
            value={body}
            onChange={(html) => {
              setBody(html);
              setDirty(true);
            }}
            folder="news"
            label={fallbackTitle}
          />
        </div>
      </div>
    </form>
  );
}
