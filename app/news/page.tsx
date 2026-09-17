import type { Metadata } from "next";
import { NewsList } from "@/components/news/NewsList";
import { PageHero } from "@/components/shared/Page";
import { getPosts } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "News",
  description: "News and announcements from FEDCOOP and its member cooperative societies.",
  alternates: { canonical: "/news" },
};

export default async function NewsPage() {
  const posts = await getPosts();
  return (
    <>
      <PageHero title="News" crumbs={[{ label: "News", href: "/news" }]} standfirst="Announcements, reports and updates from the federation and its member societies." />
      <div className="shell pb-24">
        <NewsList posts={posts} />
      </div>
    </>
  );
}
