"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { ExternalLink, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmButton, Empty, Loading, PageHead, SearchBox, Status, table, useRun } from "@/components/admin/ui";
import { api } from "@/convex/_generated/api";
import { fmtDate } from "@/lib/format";
import { pillarBySlug } from "@/lib/site";
import { btn } from "@/lib/ui";

export default function NewsAdmin() {
  const posts = useQuery(api.admin.posts.list);
  const setPublished = useMutation(api.admin.posts.setPublished);
  const remove = useMutation(api.admin.posts.remove);
  const { run } = useRun();
  const [q, setQ] = useState("");

  const rows = posts?.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHead
        title="News"
        description="Articles for /news. Bodies are written in the rich text editor and stored as HTML."
        actions={
          <Link href="/admin/news/new" className={btn.primary}>
            <Plus aria-hidden="true" /> New article
          </Link>
        }
      />
      {!rows ? (
        <Loading />
      ) : posts!.length === 0 ? (
        <Empty
          title="No articles yet"
          action={
            <Link href="/admin/news/new" className={btn.primary}>
              Write the first article
            </Link>
          }
        />
      ) : (
        <>
          <div className="mb-4">
            <SearchBox value={q} onChange={setQ} placeholder="Search articles" />
          </div>
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Title</th>
                  <th className={table.th}>Date</th>
                  <th className={table.th}>Status</th>
                  <th className={table.th}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p._id} className={table.row}>
                    <td className={table.td}>
                      <Link href={`/admin/news/${p._id}`} className="font-bold hover:text-cord">
                        {p.title}
                      </Link>
                      <p className="text-[0.82rem] text-ink-muted">
                        {p.pillars.map((x) => pillarBySlug(x)?.name ?? x).join(", ") || "No pillar"}
                        {p.author && ` · ${p.author}`}
                      </p>
                    </td>
                    <td className={`${table.td} whitespace-nowrap text-ink-muted`}>{fmtDate(p.publishedAt)}</td>
                    <td className={table.td}>
                      <Status on={p.isPublished} />
                    </td>
                    <td className={`${table.td} text-right whitespace-nowrap`}>
                      {p.isPublished && (
                        <a href={`/news/${p.slug}`} target="_blank" rel="noreferrer" className={btn.ghost} aria-label={`View ${p.title} on the site`}>
                          <ExternalLink aria-hidden="true" />
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          run(() => setPublished({ id: p._id, isPublished: !p.isPublished }), p.isPublished ? "Unpublished" : "Published")
                        }
                      >
                        {p.isPublished ? "Unpublish" : "Publish"}
                      </Button>
                      <ConfirmButton onConfirm={() => run(() => remove({ id: p._id }), "Article deleted")} />
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
