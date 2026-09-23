import { query } from "../_generated/server";
import { requireAdmin } from "../access";

export const summary = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const [enquiries, posts, events, albums, cooperatives, subscribers] = await Promise.all([
      ctx.db.query("enquiries").collect(),
      ctx.db.query("posts").collect(),
      ctx.db.query("events").collect(),
      ctx.db.query("albums").collect(),
      ctx.db.query("cooperatives").collect(),
      ctx.db.query("subscribers").collect(),
    ]);
    const now = Date.now();
    return {
      enquiries: {
        new: enquiries.filter((e) => e.status === "new").length,
        inProgress: enquiries.filter((e) => e.status === "in-progress").length,
        closed: enquiries.filter((e) => e.status === "closed").length,
      },
      recentEnquiries: enquiries
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 6)
        .map((e) => ({ _id: e._id, fullName: e.fullName, category: e.category, subject: e.subject, status: e.status, createdAt: e.createdAt })),
      posts: { total: posts.length, drafts: posts.filter((p) => !p.isPublished).length },
      events: { total: events.length, upcoming: events.filter((e) => e.isPublished && e.startsAt > now).length },
      albums: { total: albums.length, drafts: albums.filter((a) => !a.isPublished).length },
      cooperatives: { total: cooperatives.length, published: cooperatives.filter((c) => c.isPublished).length },
      subscribers: subscribers.length,
      recentPosts: posts
        .sort((a, b) => b._creationTime - a._creationTime)
        .slice(0, 5)
        .map((p) => ({ _id: p._id, title: p.title, isPublished: p.isPublished, publishedAt: p.publishedAt })),
    };
  },
});
