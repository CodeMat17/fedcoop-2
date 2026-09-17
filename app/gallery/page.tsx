import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EmptyState, PageHero } from "@/components/shared/Page";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { getAlbums } from "@/lib/data";
import { fmtDate } from "@/lib/format";
import { card, cn } from "@/lib/ui";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photographs from FEDCOOP general meetings, training, peer review and partnership events.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const albums = await getAlbums();
  return (
    <>
      <PageHero title="Gallery" crumbs={[{ label: "Gallery", href: "/gallery" }]} standfirst="Photographs from general meetings, training workshops and the work of member societies." />
      <div className="shell pb-24">
        {albums.length === 0 ? (
          <EmptyState title="No albums published yet.">Photographs from FEDCOOP events will appear here.</EmptyState>
        ) : (
          <Stagger as="ul" step={0.04} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {albums.map((a) => (
              <StaggerItem as="li" key={a._id}>
                <Link href={`/gallery/${a.slug}`} className={cn(card, "group block overflow-hidden hover:border-cord")}>
                  {/* Album covers are an intentional editorial crop, so object-cover is correct here (§14.2) */}
                  <div className="grid aspect-[4/3] grid-cols-2 grid-rows-2 gap-0.5 bg-cord-soft">
                    {Array.from({ length: 4 }, (_, i) => a.covers[i]).map((p, i) =>
                      p ? (
                        <div key={p._id} className="relative">
                          <Image src={p.publicId} alt="" fill sizes="(min-width: 1280px) 16vw, (min-width: 640px) 25vw, 50vw" className="object-cover" />
                        </div>
                      ) : (
                        <div key={i} className="bg-cord-soft" />
                      ),
                    )}
                  </div>
                  <div className="p-5">
                    <h2 className="t-card group-hover:text-cord">{a.title}</h2>
                    <p className="t-meta mt-1 text-ink-muted">
                      {fmtDate(a.date)} · {a.photoCount} {a.photoCount === 1 ? "photo" : "photos"} · {a.category}
                    </p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </>
  );
}
