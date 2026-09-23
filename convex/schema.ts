import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Clerk accounts that have opened /admin. `role` is the only thing that
  // grants access; absent means signed in but not authorised (convex/access.ts).
  users: defineTable({
    tokenIdentifier: v.string(),
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: v.optional(v.literal("admin")),
    lastSeenAt: v.number(),
  }).index("by_token", ["tokenIdentifier"]),

  cooperatives: defineTable({
    name: v.string(),
    slug: v.string(),
    acronym: v.optional(v.string()),
    aliases: v.array(v.string()),
    mda: v.string(),
    mdaCategory: v.union(
      v.literal("ministry"),
      v.literal("department"),
      v.literal("agency"),
      v.literal("parastatal"),
    ),
    stateCode: v.string(),
    city: v.optional(v.string()),
    address: v.optional(v.string()),
    about: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    foundedYear: v.optional(v.number()),
    affiliatedYear: v.optional(v.number()),
    membershipBand: v.optional(v.string()),
    membershipSize: v.optional(v.number()),
    membershipStatus: v.optional(v.union(v.literal("active"), v.literal("provisional"))),
    services: v.array(v.string()),
    committee: v.optional(v.array(v.object({ name: v.string(), office: v.string() }))),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
    isVerified: v.boolean(),
    // Registered with FEDCOOP. Absent means not registered (the default).
    isRegistered: v.optional(v.boolean()),
    isPublished: v.boolean(),
    isTestData: v.optional(v.boolean()),
    order: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_state", ["stateCode"])
    .index("by_mda", ["mda"])
    .index("by_published", ["isPublished"])
    .index("by_published_state", ["isPublished", "stateCode"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["stateCode", "mdaCategory", "isPublished"],
    }),

  stateStats: defineTable({
    stateCode: v.string(),
    stateName: v.string(),
    cooperativeCount: v.optional(v.number()),
    verified: v.boolean(),
    verifiedAt: v.optional(v.number()),
    note: v.optional(v.string()),
  })
    .index("by_state", ["stateCode"])
    .index("by_verified", ["verified"]),

  siteStats: defineTable({
    key: v.string(),
    value: v.optional(v.number()),
    label: v.string(),
    verified: v.boolean(),
    verifiedAt: v.optional(v.number()),
  }).index("by_key", ["key"]),

  // Legacy board list from the previous site; read by public:directors until
  // it is migrated into `directors`.
  excos: defineTable({
    name: v.string(),
    position: v.string(),
    description: v.optional(v.string()),
    profile: v.optional(v.string()),
    image: v.optional(v.id("_storage")),
  }),

  // Legacy articles from the previous site; migrated into `posts` by
  // migrations:newsToPosts.
  news: defineTable({
    title: v.string(),
    slug: v.string(),
    body: v.string(),
    featured: v.optional(v.boolean()),
    image: v.optional(v.id("_storage")),
  }),

  directors: defineTable({
    name: v.string(),
    office: v.string(),
    cooperative: v.optional(v.string()),
    mda: v.optional(v.string()),
    bio: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    isExecutive: v.boolean(),
    order: v.number(),
    isPublished: v.boolean(),
  })
    .index("by_order", ["order"])
    .index("by_published", ["isPublished", "order"]),

  posts: defineTable({
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    body: v.string(),
    coverUrl: v.optional(v.string()),
    coverAlt: v.optional(v.string()),
    pillars: v.array(v.string()),
    author: v.optional(v.string()),
    publishedAt: v.number(),
    isPublished: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["isPublished", "publishedAt"]),

  events: defineTable({
    title: v.string(),
    slug: v.string(),
    summary: v.string(),
    body: v.string(),
    startsAt: v.number(),
    endsAt: v.optional(v.number()),
    venue: v.string(),
    city: v.string(),
    coverUrl: v.optional(v.string()),
    pillars: v.array(v.string()),
    albumId: v.optional(v.id("albums")),
    rsvpEnabled: v.boolean(),
    isPublished: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_start", ["startsAt"])
    .index("by_published", ["isPublished", "startsAt"]),

  rsvps: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    cooperative: v.string(),
    email: v.string(),
    phone: v.string(),
    attendees: v.number(),
    createdAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_email", ["email", "createdAt"]),

  albums: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    date: v.number(),
    coverPhotoIds: v.array(v.id("photos")),
    isPublished: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["isPublished", "date"]),

  photos: defineTable({
    albumId: v.id("albums"),
    publicId: v.string(),
    width: v.number(),
    height: v.number(),
    orientation: v.union(v.literal("portrait"), v.literal("landscape"), v.literal("square")),
    blurDataUrl: v.optional(v.string()),
    alt: v.string(),
    caption: v.optional(v.string()),
    category: v.optional(v.string()),
    takenAt: v.optional(v.number()),
    order: v.number(),
  }).index("by_album", ["albumId", "order"]),

  resources: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    pillars: v.optional(v.array(v.string())),
    fileUrl: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    updatedAt: v.number(),
    isPublished: v.boolean(),
  })
    .index("by_category", ["category"])
    .index("by_published", ["isPublished", "updatedAt"]),

  enquiries: defineTable({
    category: v.union(
      v.literal("membership"),
      v.literal("general"),
      v.literal("partnership"),
      v.literal("training"),
      v.literal("peer-review"),
      v.literal("investment"),
      v.literal("directory"),
      v.literal("other"),
    ),
    fullName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    subject: v.optional(v.string()),
    message: v.string(),
    cooperativeName: v.optional(v.string()),
    mda: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
    status: v.union(v.literal("new"), v.literal("in-progress"), v.literal("closed")),
    note: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_status", ["status", "createdAt"])
    .index("by_email", ["email", "createdAt"]),

  subscribers: defineTable({
    email: v.string(),
    createdAt: v.number(),
    confirmed: v.boolean(),
  }).index("by_email", ["email"]),

  pages: defineTable({
    key: v.string(),
    title: v.string(),
    body: v.string(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  // CMS-managed collections referenced by §8.8, §9 and §11.2.
  testimonials: defineTable({
    quote: v.string(),
    name: v.string(),
    role: v.string(),
    cooperative: v.string(),
    mda: v.string(),
    order: v.number(),
    isPublished: v.boolean(),
  }).index("by_published", ["isPublished", "order"]),

  milestones: defineTable({
    year: v.number(),
    title: v.string(),
    body: v.string(),
    order: v.number(),
    isPublished: v.boolean(),
  }).index("by_published", ["isPublished", "order"]),

  partners: defineTable({
    name: v.string(),
    logoUrl: v.string(),
    url: v.optional(v.string()),
    order: v.number(),
    isPublished: v.boolean(),
  }).index("by_published", ["isPublished", "order"]),

  benefits: defineTable({
    pillar: v.string(),
    title: v.string(),
    description: v.string(),
    audience: v.optional(v.string()),
    order: v.number(),
    isPublished: v.boolean(),
  }).index("by_published", ["isPublished", "order"]),
  // TEMPORARY: off so legacy {name, status} cooperative rows can be removed with
  // `npx convex run seed:migrateLegacy`. Set back to true afterwards.
}, { schemaValidation: false });
