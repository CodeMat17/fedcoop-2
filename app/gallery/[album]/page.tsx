import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Masonry } from "@/components/gallery/Masonry";
import { EmptyState, PageHero } from "@/components/shared/Page";
import { getAlbum, getAlbums } from "@/lib/data";
import { fmtDate } from "@/lib/format";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getAlbums()).map((a) => ({ album: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/gallery/[album]">): Promise<Metadata> {
  const a = await getAlbum((await params).album);
  if (!a) return {};
  return { title: a.title, description: a.description ?? `Photographs: ${a.title}`, alternates: { canonical: `/gallery/${a.slug}` } };
}

export default async function AlbumPage({ params }: PageProps<"/gallery/[album]">) {
  const album = await getAlbum((await params).album);
  if (!album) notFound();
  return (
    <>
      <PageHero
        title={album.title}
        crumbs={[{ label: "Gallery", href: "/gallery" }, { label: album.title, href: `/gallery/${album.slug}` }]}
        standfirst={album.description}
      >
        <p className="t-meta mt-4 text-ink-muted">
          {fmtDate(album.date)} · {album.photoCount} {album.photoCount === 1 ? "photo" : "photos"}
        </p>
      </PageHero>
      <div className="shell pb-24">
        {album.photos.length ? <Masonry photos={album.photos} albumTitle={album.title} /> : <EmptyState title="This album has no photos yet." />}
      </div>
    </>
  );
}
