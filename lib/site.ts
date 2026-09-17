export const SITE = {
  name: "FEDCOOP",
  legalName: "Federal Civil Service Staff of Nigeria Cooperative Societies Union Limited",
  motto:
    "Unifying Workers Cooperatives for a Better World through Cooperation, Collaboration, Advocacy, Peer Review, Training and Investment.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://fedcoop.ng",
  description:
    "FEDCOOP is the national union of staff cooperative societies in Nigeria's federal Ministries, Departments and Agencies.",
  address: ["Federal Secretariat Complex", "Phase 1, Abuja, FCT", "Nigeria"],
  phone: "+234 (0) 916 248 4000",
  phoneHref: "tel:+2349162484000",
  email: "info@fedcoop.ng",
  hours: "Monday to Friday, 8:00 to 16:00 WAT",
} as const;

export const SOCIALS = [
  { name: "Facebook", href: "https://www.facebook.com/groups/530898437955565" },
  { name: "X", href: "https://x.com/FEDCOOP_ng" },
  { name: "Instagram", href: "https://www.instagram.com/fedcoop_ng/" },
] as const;

export const MEMBERSHIP_CTA = {
  label: "Contact FEDCOOP About Membership",
  short: "Join FEDCOOP",
  href: "/contact?category=membership",
} as const;

export type PillarSlug =
  | "cooperation"
  | "collaboration"
  | "advocacy"
  | "peer-review"
  | "training"
  | "investment";

export type Pillar = {
  slug: PillarSlug;
  name: string;
  line: string;
  standfirst: string;
  practice: string[];
  how: string[];
  cta: { label: string; category: EnquiryCategory };
};

export const PILLARS: readonly Pillar[] = [
  {
    slug: "cooperation",
    name: "Cooperation",
    line: "Societies working as one national body rather than in isolation.",
    standfirst:
      "A staff cooperative in one agency has the weight of its own members. Inside FEDCOOP it carries the weight of every federal cooperator in the country.",
    practice: [
      "Member societies share one national voice and one set of standards.",
      "Management committees meet counterparts from other MDAs at zonal and national fora.",
      "Societies facing the same problem solve it once, together.",
      "New and small societies get a support network from their first year.",
    ],
    how: [
      "FEDCOOP convenes an Annual General Meeting of member societies, where delegates set the federation's priorities and elect its board.",
      "Between meetings, the secretariat links societies with shared interests: housing, consumer supply, agriculture, transport and savings.",
    ],
    cta: { label: "Talk to us about cooperation", category: "general" },
  },
  {
    slug: "collaboration",
    name: "Collaboration",
    line: "Shared services, joint ventures and bulk purchasing power.",
    standfirst:
      "Many societies buying separately pay retail. The same societies buying through the federation negotiate as one customer.",
    practice: [
      "Group purchasing for consumer goods, vehicles and building materials.",
      "Joint ventures between societies that cannot fund a project alone.",
      "Shared service arrangements for accounting, audit preparation and software.",
      "Negotiated group terms with insurers, banks and housing developers.",
    ],
    how: [
      "Societies register interest in a scheme. When enough demand is pooled, FEDCOOP negotiates terms and publishes them to all members.",
      "Each society still signs its own agreement and keeps full control of its funds.",
    ],
    cta: { label: "Propose a partnership", category: "partnership" },
  },
  {
    slug: "advocacy",
    name: "Advocacy",
    line: "Speaking for cooperators to government, regulators and partners.",
    standfirst:
      "Payroll deductions, cooperative law and public service rules all shape what a staff cooperative can do. FEDCOOP makes sure cooperators are heard when those rules are written.",
    practice: [
      "Representation to the Office of the Head of the Civil Service of the Federation and supervising ministries.",
      "Engagement with cooperative regulators on registration, audit and compliance.",
      "Protection of lawful payroll deduction arrangements for member societies.",
      "Position papers on policy that affects federal workers' savings and welfare.",
    ],
    how: [
      "Member societies raise issues through the secretariat. The board agrees a position, and FEDCOOP takes it to the relevant authority.",
      "Outcomes are reported back to all member societies.",
    ],
    cta: { label: "Raise an issue with FEDCOOP", category: "general" },
  },
  {
    slug: "peer-review",
    name: "Peer Review",
    line: "Societies auditing and strengthening one another's governance.",
    standfirst:
      "Members trust a cooperative that can show its books are in order. Peer review lets experienced management committees check and strengthen each other's governance.",
    practice: [
      "A structured review of governance, records and loan administration.",
      "A written report with practical recommendations, not a pass or fail.",
      "Follow-up support for the areas the review identifies.",
      "Evidence of good governance that members, partners and regulators recognise.",
    ],
    how: [
      "A society requests a review. FEDCOOP assigns a team drawn from other member societies with no conflict of interest.",
      "The team reviews documents, meets the management committee, and issues a report. The society agrees an action plan and a date for follow-up.",
    ],
    cta: { label: "Request a peer review", category: "peer-review" },
  },
  {
    slug: "training",
    name: "Training",
    line: "Capacity building for management committees and members.",
    standfirst:
      "Management committees change every few years. Training makes sure each new committee can run a society well from its first meeting.",
    practice: [
      "Induction for newly elected management committee members.",
      "Bookkeeping, credit administration and financial reporting.",
      "Bye-law interpretation, AGM procedure and compliance.",
      "Member education on savings, credit and cooperative rights.",
    ],
    how: [
      "FEDCOOP runs a published training calendar of workshops in Abuja and zonal centres, and delivers in-house sessions on request.",
      "Training materials are available to member societies in the resources centre.",
    ],
    cta: { label: "See the training calendar", category: "training" },
  },
  {
    slug: "investment",
    name: "Investment",
    line: "Pooled capital, cooperative finance, housing and enterprise.",
    standfirst:
      "Individual societies hold members' savings. Pooled carefully, that capital can finance housing and enterprise that no single society could fund.",
    practice: [
      "Access to cooperative investment vehicles open to member societies.",
      "Housing schemes structured for federal workers.",
      "Enterprise projects that return value to participating societies.",
      "Clear reporting to every participating society.",
    ],
    how: [
      "Investment proposals are assessed against published criteria before any society is invited to participate.",
      "Participation is voluntary. Each society's decision to invest follows its own bye-laws and member approval.",
    ],
    cta: { label: "Talk to us about investment", category: "investment" },
  },
];

export const pillarBySlug = (slug: string) => PILLARS.find((p) => p.slug === slug);

export type EnquiryCategory =
  | "membership"
  | "general"
  | "partnership"
  | "training"
  | "peer-review"
  | "investment"
  | "directory"
  | "other";

export const ENQUIRY_CATEGORIES: { value: EnquiryCategory; label: string }[] = [
  { value: "membership", label: "Membership Enquiry" },
  { value: "general", label: "General Enquiry" },
  { value: "partnership", label: "Partnership" },
  { value: "training", label: "Training" },
  { value: "peer-review", label: "Peer Review" },
  { value: "investment", label: "Investment" },
  { value: "directory", label: "Cooperative Directory" },
  { value: "other", label: "Other" },
];

export type NavLink = { label: string; href: string; description?: string };
export type NavGroup = {
  label: string;
  href: string;
  /** Omit for a plain link with no mega panel. */
  links?: NavLink[];
  panel?: "about" | "pillars" | "media";
};

export const NAV: NavGroup[] = [
  {
    label: "About",
    href: "/about",
    panel: "about",
    links: [
      { label: "About FEDCOOP", href: "/about", description: "Who we are, how we are governed." },
      { label: "Board of Directors", href: "/directors", description: "The people elected to lead the federation." },
    ],
  },
  {
    label: "What We Do",
    href: "/what-we-do",
    panel: "pillars",
    links: PILLARS.map((p) => ({ label: p.name, href: `/what-we-do/${p.slug}`, description: p.line })),
  },
  {
    label: "Member Cooperatives",
    href: "/cooperatives",
  },
  {
    label: "Media",
    href: "/news",
    panel: "media",
    links: [
      { label: "News", href: "/news", description: "Announcements and reports." },
      { label: "Events", href: "/events", description: "AGMs, training and fora." },
      { label: "Gallery", href: "/gallery", description: "Photographs from the federation." },
      { label: "Resources", href: "/resources", description: "Documents, guides and training materials." },
    ],
  },
];

export const NAV_SINGLE: NavLink[] = [{ label: "Contact", href: "/contact" }];

export const CONTACT_CTA = { label: "Contact FEDCOOP", short: "Contact Us", href: "/contact" } as const;
