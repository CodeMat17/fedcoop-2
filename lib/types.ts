/** Plain shapes mirroring convex/schema.ts, as returned by the public queries. */

type MdaCategory = "ministry" | "department" | "agency" | "parastatal";

export type Cooperative = {
  _id: string;
  _creationTime: number;
  name: string;
  slug: string;
  acronym?: string;
  aliases: string[];
  mda: string;
  mdaCategory: MdaCategory;
  stateCode: string;
  city?: string;
  address?: string;
  about?: string;
  logoUrl?: string;
  foundedYear?: number;
  affiliatedYear?: number;
  membershipBand?: string;
  membershipSize?: number;
  membershipStatus?: "active" | "provisional";
  services: string[];
  committee?: { name: string; office: string }[];
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  isVerified: boolean;
  /** Registered with FEDCOOP; absent means not registered. */
  isRegistered?: boolean;
};

export type StateStat = {
  stateCode: string;
  stateName: string;
  cooperativeCount: number;
  verifiedAt: number;
};

export type SiteStat = {
  key: string;
  value: number;
  label: string;
  verifiedAt: number;
};

export type Director = {
  _id: string;
  name: string;
  office: string;
  cooperative?: string;
  mda?: string;
  bio?: string;
  photoUrl?: string;
  isExecutive: boolean;
  order: number;
};

export type Post = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverUrl?: string;
  coverAlt?: string;
  pillars: string[];
  author?: string;
  publishedAt: number;
};

export type EventItem = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  startsAt: number;
  endsAt?: number;
  venue: string;
  city: string;
  coverUrl?: string;
  pillars: string[];
  albumId?: string;
  albumSlug?: string;
  rsvpEnabled: boolean;
};

export type Photo = {
  _id: string;
  publicId: string;
  width: number;
  height: number;
  orientation: "portrait" | "landscape" | "square";
  blurDataUrl?: string;
  alt: string;
  caption?: string;
  category?: string;
  takenAt?: number;
  order: number;
};

export type Album = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  category: string;
  date: number;
  covers: Photo[];
  photoCount: number;
};

export type AlbumWithPhotos = Album & { photos: Photo[] };

export type Resource = {
  _id: string;
  title: string;
  description?: string;
  category: string;
  pillars?: string[];
  fileUrl: string;
  fileType: string;
  fileSize: number;
  updatedAt: number;
};

export type PageContent = { key: string; title: string; body: string; updatedAt: number };

export type Testimonial = {
  _id: string;
  quote: string;
  name: string;
  role: string;
  cooperative: string;
  mda: string;
};

export type Milestone = { _id: string; year: number; title: string; body: string };
export type Partner = { _id: string; name: string; logoUrl: string; url?: string };

export type SearchEntry = {
  type: "Cooperative" | "MDA" | "State" | "News" | "Event" | "Page";
  title: string;
  hint?: string;
  href: string;
  keywords?: string;
};
