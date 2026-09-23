"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { AlertTriangle, ImageIcon, Plus } from "lucide-react";
import { Empty, Loading, PageHead, Status } from "@/components/admin/ui";
import { thumb } from "@/components/admin/upload";
import { api } from "@/convex/_generated/api";
import { fmtDate } from "@/lib/format";
import { btn, card, cn } from "@/lib/ui";

export default function GalleryAdmin() {
  const albums = useQuery(api.admin.albums.list);
  return (
    <>
      <PageHead
        title="Gallery"
        description="Photo albums. Photos upload straight to Cloudinary; every photo needs alt text before its album can be published."
        actions={
          <Link href="/admin/gallery/new" className={btn.primary}>
            <Plus aria-hidden="true" /> New album
          </Link>
        }
      />
      {!albums ? (
        <Loading />
      ) : albums.length === 0 ? (
        <Empty title="No albums yet" action={<Link href="/admin/gallery/new" className={btn.primary}>Create an album</Link>} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {albums.map((a) => (
            <li key={a._id}>
              <Link href={`/admin/gallery/${a._id}`} className={cn(card, "block overflow-hidden hover:border-cord")}>
                <div className="relative aspect-[16/10] bg-cord-soft">
                  {a.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb(a.cover, 640)} alt="" className="absolute inset-0 size-full object-cover" />
                  ) : (
                    <ImageIcon className="absolute top-1/2 left-1/2 size-8 -translate-1/2 text-cord/40" aria-hidden="true" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold">{a.title}</p>
                    <Status on={a.isPublished} />
                  </div>
                  <p className="mt-1 text-[0.85rem] text-ink-muted">
                    {a.category} · {fmtDate(a.date)} · {a.photoCount} photo{a.photoCount === 1 ? "" : "s"}
                  </p>
                  {a.missingAlt > 0 && (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-[0.82rem] font-bold text-brass">
                      <AlertTriangle className="size-3.5" aria-hidden="true" /> {a.missingAlt} missing alt text
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
