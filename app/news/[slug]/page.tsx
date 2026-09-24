import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/shared/Cards";
import { CoverHero } from "@/components/shared/CoverHero";
import { JsonLd } from "@/components/shared/JsonLd";
import { PageHero, Rich } from "@/components/shared/Page";
import { ShareRow } from "@/components/shared/ShareRow";
import { getPost, getPosts } from "@/lib/data";
import { fmtDate, readingTime } from "@/lib/format";
import { OG_DEFAULTS, OG_IMAGE, SITE, pillarBySlug } from "@/lib/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/news/${post.slug}` },
    openGraph: {
      ...OG_DEFAULTS,
      type: "article",
      url: `/news/${post.slug}`,
      publishedTime: new Date(post.publishedAt).toISOString(),
      images: post.coverUrl ? [post.coverUrl] : [OG_IMAGE],
    },
  };
}

export default async function Article({ params }: PageProps<"/news/[slug]">) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const related = (await getPosts()).filter((p) => p._id !== post._id && p.pillars.some((x) => post.pillars.includes(x))).slice(0, 3);
  const url = `${SITE.url}/news/${post.slug}`;

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: post.title,
          description: post.excerpt,
          image: post.coverUrl ? [post.coverUrl] : undefined,
          datePublished: new Date(post.publishedAt).toISOString(),
          author: post.author ? { "@type": "Person", name: post.author } : { "@type": "Organization", name: "FEDCOOP" },
          publisher: { "@type": "Organization", name: SITE.legalName, logo: { "@type": "ImageObject", url: `${SITE.url}/logo.webp` } },
          mainEntityOfPage: url,
        }}
      />
      <PageHero title={post.title} crumbs={[{ label: "News", href: "/news" }, { label: post.title, href: `/news/${post.slug}` }]}>
        <p className="t-meta mt-6 tracking-[0.06em] text-ink-muted uppercase">
          <time dateTime={new Date(post.publishedAt).toISOString()}>{fmtDate(post.publishedAt)}</time>
          {post.author && ` · ${post.author}`} · {readingTime(post.body)}
          {post.pillars.length > 0 && ` · ${post.pillars.map((p) => pillarBySlug(p)?.name ?? p).join(", ")}`}
        </p>
      </PageHero>
      {post.coverUrl && <CoverHero src={post.coverUrl} alt={post.coverAlt ?? ""} />}
      <div className="shell pb-24">
        <Rich html={post.body} />
        <ShareRow url={url} title={post.title} className="mt-12" />
        {related.length > 0 && (
          <section aria-labelledby="related-h" className="mt-20 border-t border-cord-line pt-14">
            <p className="eyebrow mb-4">Keep reading</p>
            <h2 id="related-h" className="t-section mb-8">Related articles</h2>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {related.map((p) => (
                <li key={p._id}><PostCard post={p} /></li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
