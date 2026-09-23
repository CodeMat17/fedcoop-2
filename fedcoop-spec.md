# FEDCOOP — Official Website Build Specification

> **Client:** Federal Civil Service Staff of Nigeria Cooperative Societies Union Limited (FEDCOOP)
> **Motto:** *Unifying Workers Cooperatives for a Better World through Cooperation, Collaboration, Advocacy, Peer Review, Training and Investment.*
> **Deliverable:** A complete rebuild of the public website + admin CMS
> **Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Framer Motion · next-themes · Convex · Cloudinary
> **Font:** Nunito (Google Fonts) — 300 / 400 / 600 / 700 / 800 / 900
> **Non-negotiables:** mobile-first · light + dark themes only · database-driven numbers · near-zero Vercel Fluid Active CPU

---

## 0. How to use this document

This is the single source of truth. Build in the order given in **§20 Build order**. Do not invent statistics, cooperative counts, member names, or state figures — every number rendered on the public site must come from Convex, and every empty value must render a defined empty state (see **§18**).

Where this document gives exact copy in quotes, use it verbatim. Where it says *placeholder*, write real, specific copy in the voice described in **§3.6** — never lorem ipsum.

---

## 1. The organisation

FEDCOOP is the national umbrella body for staff cooperative societies inside Nigeria's federal Ministries, Departments and Agencies (MDAs). Member societies include cooperatives at NFVCB, CBN, ICPC, NTA, NBC, EFCC, NCC, NNPC, FMAFS, FMTI and others, drawn from all 36 states and the FCT.

**Six pillars** (these structure the whole site):

| Pillar | What it means to a visitor |
|---|---|
| Cooperation | Societies working as one national body rather than in isolation |
| Collaboration | Shared services, joint ventures, bulk purchasing power |
| Advocacy | Speaking for cooperators to government, regulators and partners |
| Peer Review | Societies auditing and strengthening one another's governance |
| Training | Capacity building for management committees and members |
| Investment | Pooled capital, cooperative finance, housing and enterprise |

**Contact block (footer + contact page):**

```
Federal Secretariat Complex
Phase 1, Abuja, FCT
Nigeria

+234 (0) 916 248 4000
email@fedcoop.org
```

**Social handles (footer, contact page, article share):**

- Facebook — `https://www.facebook.com/groups/530898437955565`
- X — `https://x.com/FEDCOOP_ng`
- Instagram — `https://www.instagram.com/fedcoop_ng/`

Render these as icon links with `aria-label` (e.g. `aria-label="FEDCOOP on Instagram"`), `target="_blank"`, `rel="noopener noreferrer"`. Do not print the raw URLs.

**Audience, in priority order:**

1. Management committees of MDA cooperative societies considering affiliation
2. Existing member societies looking for training, peer review, advocacy support
3. Individual civil servants trying to find their agency's cooperative
4. Government, regulators, development partners and insurers assessing FEDCOOP's reach

The site's primary job is to make FEDCOOP's **national scale feel real** and to make **affiliation feel obvious and easy**.

---

## 2. Stack and bootstrap

```bash
npx create-next-app@latest fedcoop --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd fedcoop
npx shadcn@latest init
npx convex dev
```

```bash
npm i framer-motion next-themes lucide-react convex @tanstack/react-table \
  cmdk sonner date-fns zod react-hook-form @hookform/resolvers \
  next-cloudinary d3-geo topojson-client react-simple-maps embla-carousel-react

npx shadcn@latest add button card input textarea select label badge dialog sheet \
  dropdown-menu tabs accordion separator skeleton avatar tooltip command \
  breadcrumb pagination form sonner scroll-area popover table alert
```

### Rules

- **Routing middleware lives in `proxy.ts`, not `middleware.ts`.** Next.js has replaced `middleware.ts` with `proxy.ts` — use the new file and the new export signature. Keep it thin: security headers and admin route protection only. No data fetching, no logging, no heavy regex.
- **App Router only.** Server Components by default; `"use client"` only on leaves that need state, motion, or browser APIs.
- **No `middleware`-based redirects for locale, theme, or A/B.** Theme is resolved client-side by `next-themes`.
- **TypeScript strict.** No `any`. Convex generates types — use them end to end.
- Node runtime for all route handlers. Fluid compute on. See **§16**.

### Project structure

```
src/
├── app/
│   ├── layout.tsx                  # fonts, ThemeProvider, ConvexProvider, Header, Footer, Cord
│   ├── page.tsx                    # Home
│   ├── about/page.tsx
│   ├── about/leadership/page.tsx
│   ├── what-we-do/page.tsx
│   ├── what-we-do/[pillar]/page.tsx
│   ├── membership/
│   │   ├── become-a-member/page.tsx
│   │   └── benefits/page.tsx
│   ├── cooperatives/
│   │   ├── page.tsx                # All Cooperatives (directory)
│   │   ├── by-mda/page.tsx         # Search by MDA
│   │   ├── map/page.tsx            # Cooperative Map of Nigeria
│   │   ├── state/[state]/page.tsx  # State landing
│   │   └── [slug]/page.tsx         # Cooperative Profile
│   ├── news/page.tsx
│   ├── news/[slug]/page.tsx
│   ├── events/page.tsx
│   ├── events/[slug]/page.tsx
│   ├── gallery/page.tsx
│   ├── gallery/[album]/page.tsx
│   ├── resources/page.tsx          # Downloads centre
│   ├── contact/page.tsx
│   ├── search/page.tsx
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   ├── not-found.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── opengraph-image.tsx
│   └── admin/…                     # CMS, see §15
├── components/
│   ├── cord/                       # signature motion system, §6
│   ├── layout/                     # header, mega-menu, mobile-nav, footer, theme-toggle
│   ├── map/                        # NigeriaMap, StateTooltip, StateTable, MapLegend
│   ├── gallery/                    # MasonryGrid, Lightbox, AlbumCard
│   ├── directory/                  # CoopCard, DirectoryFilters, MdaSearch
│   ├── motion/                     # primitives, §7
│   └── ui/                         # shadcn
├── convex/                         # schema.ts, queries, mutations, §14
├── lib/                            # utils, states.ts, cloudinary.ts, seo.ts
├── data/nigeria-states.json        # TopoJSON, 36 states + FCT
├── proxy.ts
└── styles/globals.css
```

---

## 3. Design direction

### 3.1 Concept — "One Cord"

A cooperative is many small strands that only hold weight once they are twisted together. That is the whole idea of FEDCOOP, and it is the one visual idea this site spends its boldness on.

A single **cord** — a drawn SVG line — enters at the top of the home page as several loose strands from the edges of the viewport, braids into one thick cord as the visitor scrolls, and then runs the full height of the site as the spine that every section attaches to. On interior pages it persists as a slim vertical rule down the left gutter (desktop) or as a 3px progress cord under the header (mobile). It is the navigation progress indicator, the section divider, and the brand mark, all at once.

Everything else stays quiet and disciplined so the cord reads. No decorative gradient washes, no card shadows on everything, no floating blobs.

### 3.2 Colour — three, no more

Two chromatic, one ink. Every other surface is a tint or shade of these.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--cord` | `#0E4D3C` | `#3FBF93` | Primary. Cooperative green — the movement's own colour and Nigeria's. Cord, links, primary buttons, active states. |
| `--brass` | `#B5761A` | `#E3A233` | Accent. Harvest brass, carried from FEDCOOP's existing amber identity. Data highlights, map heat peak, CTA hover, focus ring. |
| `--ink` | `#101A17` | `#F2F5F3` | Text and structure. A green-black, never pure `#000`. |

Derived surfaces:

```css
:root {
  --cord:        #0E4D3C;
  --cord-soft:   #E4EEE9;   /* section tints, map low band */
  --cord-line:   #C7DAD2;   /* hairlines, borders */
  --brass:       #B5761A;
  --brass-soft:  #F6E9D2;
  --ink:         #101A17;
  --ink-muted:   #4B5B55;
  --paper:       #F6F8F6;   /* page background */
  --paper-raise: #FFFFFF;   /* cards, sheets */
}

.dark {
  --cord:        #3FBF93;
  --cord-soft:   #12241E;
  --cord-line:   #1E362E;
  --brass:       #E3A233;
  --brass-soft:  #2A2013;
  --ink:         #F2F5F3;
  --ink-muted:   #9AAEA6;
  --paper:       #08110E;
  --paper-raise: #0E1B16;
}
```

Wire these into Tailwind v4 via `@theme inline` so `bg-paper`, `text-ink`, `border-cord-line` work as utilities. **Never hard-code a hex in a component.** Both themes must pass WCAG AA for body text and AAA for the cord green on paper.

### 3.3 Type — Nunito, at full range

One family. The personality comes from the weight spread, not from a second face.

```ts
import { Nunito } from "next/font/google";
export const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});
```

| Role | Size (mobile → desktop) | Weight | Tracking | Leading |
|---|---|---|---|---|
| Display / hero | `2.75rem → 5.5rem` | 900 | `-0.04em` | `0.95` |
| Page title | `2rem → 3.25rem` | 800 | `-0.03em` | `1.05` |
| Section head | `1.5rem → 2.25rem` | 800 | `-0.02em` | `1.15` |
| Card title | `1.125rem` | 700 | `-0.01em` | `1.3` |
| Body | `1rem → 1.0625rem` | 400 | `0` | `1.7` |
| Body large (intro) | `1.125rem → 1.375rem` | 300 | `-0.01em` | `1.55` |
| Data / stat | `2.5rem → 4rem` | 900 | `-0.03em` | `1` | 
| Meta | `0.8125rem` | 600 | `0.01em` | `1.4` |

Rules:

- Body line length capped at **68 characters** (`max-w-[34rem]` for prose columns).
- All numerals in stats, tables and the map use `font-variant-numeric: tabular-nums`.
- **Sentence case everywhere.** No tracked-out all-caps eyebrow labels above headings.
- Do not colour or italicise one word inside a headline for emphasis. If a headline needs emphasis, change the whole line's weight or set it on its own line.
- No monospace anywhere on the public site.

### 3.4 Layout

Mobile-first, single column, 20px gutters. Breakpoints `sm 640 / md 768 / lg 1024 / xl 1280`. Content max width `1200px`; prose max width `680px`.

Desktop uses an **asymmetric 12-column grid with a persistent 88px left gutter** reserved for the cord and section index. Content starts at column 2. This off-centre placement is the layout signature — resist re-centring it.

```
DESKTOP                                   MOBILE
┌────┬──────────────────────────────┐     ┌──────────────────────┐
│    │  Section head                │     │ ▓▓▓ cord progress    │
│ ║  │                              │     ├──────────────────────┤
│ ║  │  Body / grid / media         │     │ Section head         │
│ ║  │                              │     │                      │
│ ║  ├──────────────────────────────┤     │ Body                 │
│ ║  │  Next section                │     │                      │
│cord│                              │     │ ─────────────────    │
└────┴──────────────────────────────┘     └──────────────────────┘
```

Sections are separated by generous vertical rhythm (`py-20 md:py-32`) and a hairline in `--cord-line`, not by alternating background blocks.

### 3.5 Structure and restraint

- Border radius: `4px` for inputs and chips, `12px` for cards, `0` for full-bleed media. One radius per hierarchy level, not one radius for everything.
- Shadows: none by default. Elevation is communicated with `--paper-raise` and a hairline border. The only shadow in the system is on the lightbox and the mobile nav sheet.
- Numbered markers (01 / 02 / 03) are used **only** on the membership process and the peer review cycle, because those genuinely are sequences.
- Icons: `lucide-react`, `1.5` stroke, sized to the text they sit with.

### 3.6 Voice

Plain, confident, institutional but not stiff. Short verbs. No exclamation marks. Never sell — state.

- Good: "Find your agency's cooperative." / "Affiliation takes four steps." / "We have no verified figure for this state yet."
- Bad: "Unlock the power of cooperative synergy!" / "Submit" / "Oops! Something went wrong."

Buttons name the outcome and keep the same name through the flow: the button "Send enquiry" produces the toast "Enquiry sent."

---

## 4. Theming

`next-themes` with **exactly two modes: light and dark.** No system option in the toggle UI, though `enableSystem` may set the initial value.

```tsx
<ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
```

- Toggle sits in the header, right of the nav on desktop, top-right of the mobile sheet.
- Toggle is a two-state switch showing sun/moon, `aria-label="Switch to dark theme"` / `"Switch to light theme"`, and it animates the icon with a 180° rotate + crossfade at 200ms. This is user-triggered motion — it is welcome.
- Add `suppressHydrationWarning` on `<html>`. No theme flash: `next-themes` injects its script before paint.
- `<meta name="theme-color">` per scheme: light `#F6F8F6`, dark `#08110E`.
- Every image with a transparent background needs a dark-mode-safe variant or a `--paper-raise` plate behind it. Test the logo on both.

---

## 5. Information architecture

### 5.1 Navigation

```text
Home

About
├── About FEDCOOP
└── Board of Directors

What We Do
├── Cooperation
├── Collaboration
├── Advocacy
├── Peer Review
├── Training
└── Investment

Membership
├── Become a Member
└── Membership Benefits

Member Cooperatives
├── All Cooperatives
├── Search by MDA
├── Cooperative Map of Nigeria
└── Cooperative Profile

Media
├── News
├── Events
└── Gallery

Resources

Contact
```

**Header behaviour**

- Desktop: transparent over the hero, then on scroll past 80px it becomes `--paper` with a `--cord-line` bottom hairline and reduces height from 88px to 64px. Animate with `useScroll` + `useMotionValueEvent`, transform/opacity only.
- "About", "What We Do", "Membership", "Member Cooperatives" and "Media" open a **mega panel** (not a dropdown list): two columns, links left, a contextual card right (e.g. Membership shows the live count of member societies; Member Cooperatives shows a miniature of the Nigeria map that links to `/cooperatives/map`).
- Mobile: hamburger opens a full-height `Sheet` from the right. Sections are `Accordion` items. The theme toggle, phone number and the primary CTA sit pinned at the bottom of the sheet, above the safe area (`env(safe-area-inset-bottom)`).
- Persistent primary CTA in the header: **"Contact FEDCOOP About Membership"** → `/contact?category=membership`. On mobile it collapses to **"Join FEDCOOP"**.
- ⌘K / Ctrl+K opens `cmdk` site search (see §13.7).

### 5.2 Footer

Four columns on desktop, stacked accordion on mobile:

1. Logo, full legal name, motto, the three social icons.
2. Quick links — About FEDCOOP, Member Cooperatives, Cooperative Map, Recent Events, Board of Directors, Contact.
3. Contact block from §1, with `tel:` and `mailto:` links.
4. Newsletter — single email field, "Get FEDCOOP updates", inline validation, honeypot.

Bottom bar: `© {currentYear} FEDCOOP — Federal Civil Service Staff of Nigeria Cooperative Societies Union Limited.` · Privacy · Terms · a discreet Admin link.

---

## 6. The Cord — signature motion system

Build this first, in `components/cord/`. Everything else hangs off it.

### 6.1 Behaviour

| Context | Rendering |
|---|---|
| Home hero | Six loose strands enter from the viewport edges as SVG paths, converge and braid into one cord by the end of the hero. Plays once on load, 1.6s, `easeOut`, staggered 60ms per strand. |
| Home body | The cord runs down the left gutter. Its `pathLength` is bound to scroll progress, so it draws itself as the visitor descends. |
| Section anchors | Each section has a node on the cord — a 10px circle that fills with `--cord` and scales `1 → 1.35 → 1` when its section enters view. |
| Interior pages | No braid. A 2px static rule in `--cord-line` in the left gutter, overlaid by a `--cord` fill bound to scroll. |
| Mobile (all pages) | The gutter cord is hidden. Instead a 3px horizontal progress bar sits directly under the header, `scaleX` bound to page scroll progress, `transform-origin: left`. |
| Reduced motion | The cord renders fully drawn and static. No scroll binding, no braid animation. |

### 6.2 Implementation

```tsx
// components/cord/ScrollCord.tsx  ("use client")
const { scrollYProgress } = useScroll();
const drawn = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.001 });
// <motion.path style={{ pathLength: drawn }} … />
```

- Use `LazyMotion` with `domAnimation` at the root and `m.*` components everywhere, so the full Framer bundle is never shipped.
- Animate **only** `transform`, `opacity` and `pathLength`. Never `top/left/width/height`.
- Wrap the whole cord in `will-change: transform` and remove it on animation end.
- One `useScroll` instance at the root, published through context. Do not create a scroll listener per section.

### 6.3 Motion tokens

```ts
export const ease = { out: [0.16, 1, 0.3, 1], inOut: [0.65, 0, 0.35, 1] } as const;
export const dur  = { fast: 0.2, base: 0.4, slow: 0.7, cinematic: 1.2 } as const;
```

- Scroll-triggered reveals: `whileInView` with `viewport={{ once: true, amount: 0.25, margin: "0px 0px -10% 0px" }}`.
- **Do not** put a fade-and-slide-up on every section — that is the generic default. Reveals are reserved for: the hero, the impact numbers, the map, and gallery items. Everything else appears with the page.
- Page transitions: `AnimatePresence` in the template, 240ms opacity + 8px y. Nothing longer — long page transitions feel broken on 3G.
- **Smooth scrolling:** `html { scroll-behavior: smooth }` plus `scroll-margin-top` on all anchor targets. Do **not** install Lenis or any JS smooth-scroll hijacker — it fights mobile momentum scrolling and tanks INP. The "smoothness" comes from the spring-damped cord and from `content-visibility`, not from overriding native scroll.
- Global: honour `prefers-reduced-motion` with a `useReducedMotion()` guard in every motion component, and a CSS fallback that sets `animation-duration: 0.01ms`.

---

## 7. Shared motion primitives

Create these once in `components/motion/` and reuse. No ad-hoc `motion.div` variants scattered through pages.

| Component | Purpose |
|---|---|
| `<Reveal>` | Opacity + 16px y, `once`, respects reduced motion. Accepts `delay`. |
| `<Stagger>` / `<StaggerItem>` | Parent orchestrates children at 60ms. Used by directory grids and gallery. |
| `<CountUp value>` | Animates a number from 0 when in view, tabular-nums, stops at the real value. Never runs if the value is `null`. |
| `<Marquee>` | The member-cooperative acronym ribbon on the home page. Pure CSS translate, pauses on hover and on `prefers-reduced-motion`. Duplicated track for seamless loop. |
| `<ParallaxMedia>` | Max 40px of `y` travel on a full-bleed image, scroll-linked. Used at most three times site-wide. |
| `<Magnetic>` | Primary CTA only. 6px pull toward the cursor. Disabled on touch. |

---

## 8. Page: Home (`/`)

Nine sections, in order. Everything above the fold must render from the static shell — no data fetch blocks the hero.

### 8.1 Hero

Full viewport height on desktop (`min-h-[92svh]`), `min-h-[85svh]` on mobile — use `svh`, not `vh`, so mobile browser chrome does not clip it.

The braid plays behind the type. Left-aligned, starting at grid column 2.

```
┌──────────────────────────────────────────────┐
│  ╲ ╲ ╲   strands converging                  │
│   ╲ ╲╲                                       │
│                                              │
│   Three hundred thousand civil               │
│   servants. One federation.                  │
│                                              │
│   FEDCOOP unites the staff cooperative       │
│   societies of Nigeria's federal MDAs …      │
│                                              │
│   [ Become a member ]  [ Find your co-op ]   │
│                                              │
│   ║ cord continues down                      │
└──────────────────────────────────────────────┘
```

- H1 in Display 900. Two lines, hard-broken with a `<br className="hidden md:block" />`.
- Sub-paragraph in Body large 300, max 52ch.
- Primary CTA "Become a member" → `/membership/become-a-member`. Secondary "Find your co-op" → `/cooperatives/by-mda`.
- No scroll-down chevron, no bouncing arrow.

### 8.2 Member ribbon

The `<Marquee>` of member cooperative names (NFVCB, CBN, ICPC, NTA, NBC, EFCC, NCC, FMD, NNPC, FMAFS, FMTI …), pulled live from Convex, two rows scrolling in opposite directions at different speeds. Each name is a link to its profile. Rendered in `--ink-muted` at weight 700, `--cord` on hover.

### 8.3 Mission and vision

Two-up on desktop, stacked on mobile. Pulled from the CMS so FEDCOOP can edit them. If either is empty, hide the block entirely rather than showing a heading with nothing under it.

### 8.4 The six pillars

A 2×3 grid on desktop, single column on mobile. Each pillar is a link to `/what-we-do/[pillar]` with a one-line description and an icon. Cards are bordered, not shadowed, and the border shifts to `--cord` on hover with a 200ms transition. No lift, no scale.

### 8.5 National reach — map teaser

A non-interactive, statically rendered miniature of the Nigeria map with the three highest-count states labelled, beside the headline "FEDCOOP reaches all 36 states and the FCT." CTA: **"Explore Cooperatives →"** to `/cooperatives/map`.

This teaser must **not** load the interactive map bundle. It is a lightweight inline SVG.

### 8.6 Impact numbers

Four `<CountUp>` figures on a `--cord-soft` band, tabular-nums, each with a plain-language label beneath. All four values come from Convex aggregates.

```
   150+            300,000+          36 + FCT          6
   member          members           states            pillars
   societies       represented       covered           of service
```

Any figure without a verified value in the database renders as an em dash with the label "figure pending verification". **Never fabricate.**

### 8.7 Latest news + upcoming events

Three most recent published news items, then the next two events, in a combined two-column band. Each card: Cloudinary image (16:9, `sizes` set), date, title, one-line excerpt.

### 8.8 Testimonials

Horizontal `embla-carousel` of quotes from member societies. Attribution: person, role, cooperative, MDA. Swipeable on mobile with visible dot indicators. Auto-advance disabled — that is non-user-triggered motion with no informational value.

### 8.9 Closing CTA

Full-bleed `--cord` band, `--paper` text. Headline "Bring your cooperative into the federation." Single button: **"Contact FEDCOOP About Membership"**.

---

## 9. Page: About (`/about`)

- Page hero: title + one-paragraph standfirst, cord rule beneath.
- Who we are — prose, 680px column, CMS-managed rich text.
- Mission / Vision / Core values.
- History timeline — vertical, tied into the cord, each milestone a node. Numbered markers **are** appropriate here (it is a sequence). CMS-managed.
- Governance structure — how the federation, its member societies and the management committee relate. Include an inline SVG diagram, responsive, with a text equivalent for screen readers.
- Affiliations and partners — logo grid, greyscale until hover, links out.
- CTA to Board of Directors.

### `/about/leadership` — Board of Directors

Grid of directors: Cloudinary portrait (4:5 portrait crop), name, office, MDA/cooperative of origin, optional short bio in a `Dialog`. Order controlled by an `order` field in Convex. Executive officers appear first at a larger card size, then the rest of the board.

---

## 10. Page: What We Do (`/what-we-do` and `/what-we-do/[pillar]`)

Index page: the six pillars as full-width rows, alternating media side on desktop, always image-above-text on mobile.

Each pillar page is statically generated from `generateStaticParams` and follows one template:

1. Pillar hero — title, standfirst, single full-bleed image.
2. What this means in practice — 3–5 bullet outcomes.
3. How it works — process or programme detail.
4. Evidence — related news items, events and downloadable resources filtered by pillar tag.
5. CTA — pillar-specific: Training → "See the training calendar"; Peer Review → "Request a peer review"; Investment → "Talk to us about investment". All route to `/contact` with the matching enquiry category preselected.

**Peer Review** gets one extra module: a **governance self-check** — 10 yes/no questions (AGM held in the last 12 months, audited accounts filed, loan policy documented, etc.) that produces a client-side score band and a recommendation to request a formal peer review. Entirely client-side, no submission, no storage, no personal data. This is a genuinely useful tool and it costs zero server CPU.

---

## 11. Membership

### 11.1 `/membership/become-a-member`

**There is no online membership application form on this page.** This is a deliberate requirement — do not add one, do not add a multi-step wizard, do not add a file upload.

The page explains and then hands off to Contact.

Sections:

1. **Who can join** — eligibility. Registered staff cooperative societies of federal MDAs, parastatals and agencies; societies must be registered under the Cooperative Societies Act and in good standing.
2. **Why cooperatives join FEDCOOP** — the argument, tied to the six pillars. Collective bargaining power, access to national partnerships (insurance, housing, finance), governance credibility through peer review, training for management committees, a voice in policy.
3. **Membership benefits** — a condensed set with a link to the full benefits page.
4. **The membership process** — a four-step numbered sequence rendered on the cord. Numbering is correct here because it is a real sequence.

   ```
   01  Get in touch          Contact FEDCOOP and tell us about your society.
   02  Documentation         Provide your registration and governance records.
   03  Review                FEDCOOP reviews your submission and may request a meeting.
   04  Affiliation           Your society is admitted and listed in the national directory.
   ```

5. **What you may be asked for** — a plain checklist, not a form:
   - Certificate of registration of the cooperative society
   - Bye-laws / constitution
   - Names and offices of the current management committee
   - Most recent audited accounts or financial statement
   - Approximate membership size
   - The MDA the society serves
   - A contact person, email and phone number

   Present as a list with check icons and an explicit note: "Do not send documents through this website. FEDCOOP will tell you where to send them after you make contact."

6. **Primary CTA** — a single, prominent button:

   > **Contact FEDCOOP About Membership**

   Links to `/contact?category=membership`. Repeat it once at the top of the page and once at the bottom. No other competing CTA on this page.

7. FAQ accordion — 6–8 questions with `FAQPage` structured data.

### 11.2 `/membership/benefits`

The full benefits catalogue, grouped by pillar. Each benefit: title, two-sentence description, and where relevant a "who it's for" tag. Include the insurance and group scheme benefits, training entitlements, peer review support, advocacy representation, and access to cooperative investment vehicles — content CMS-managed so FEDCOOP can maintain it.

Close with a comparison strip: what a society can do alone vs. what it can do inside the federation. Two columns, no icons, just clear type.

---

## 12. Member Cooperatives

### 12.1 `/cooperatives` — All Cooperatives

A directory, not a marketing page.

- Search input (name, acronym, MDA) — debounced 250ms, client-side over a statically shipped index for the first 500 entries; falls back to a Convex search query beyond that.
- Filters: State, MDA category (Ministry / Department / Agency / Parastatal), Membership status, Services offered (savings, loans, housing, consumer, agriculture, transport).
- Sort: A–Z, newest affiliated, largest membership.
- View toggle: card grid (default on mobile) / compact table (default on desktop, `@tanstack/react-table`).
- URL-synced filter state via `nuqs`-style search params so a filtered view is shareable and, crucially, cacheable.
- Result count reads "Showing 24 of 156 cooperative societies."
- Empty state: "No cooperative matches these filters. Clear filters, or search by MDA instead." with both actions as buttons.
- Pagination, 24 per page, not infinite scroll — infinite scroll breaks the footer and hurts SEO.

**Card anatomy:** logo or monogram fallback, society name, acronym badge, MDA, state, membership-size band, verified badge if `isVerified`.

### 12.2 `/cooperatives/by-mda` — Search by MDA

A different mental model to the directory: the visitor knows their agency, not the society name.

- Big single search field, autofocused on desktop only.
- Below it, an A–Z accordion of all MDAs that have an affiliated society. Each MDA expands to show its society, or shows "No affiliated society yet — tell us about yours" linking to `/contact?category=membership`.
- Alphabet jump bar, sticky on scroll.
- Common acronym aliases must resolve (e.g. "Central Bank" finds CBN; "Film censors" finds NFVCB). Store an `aliases: string[]` field on each cooperative and match against it.

### 12.3 `/cooperatives/map` — Cooperative Map of Nigeria

A headline feature. Full spec in **§13**.

### 12.4 `/cooperatives/state/[state]` — State landing

Generated for all 37 (36 states + FCT). Title "Cooperatives in Kaduna". Shows the verified count, the list of societies in that state, and a link back to the map. Where no verified data exists, the page still exists but says so plainly and offers the membership CTA.

### 12.5 `/cooperatives/[slug]` — Cooperative Profile

`generateStaticParams` over all published cooperatives; ISR with tag-based revalidation.

```
┌───────────────────────────────────────────┐
│ [logo]  Society name                      │
│         MDA · State · Affiliated 2019     │
│         [Verified member]                 │
├───────────────────────────────────────────┤
│ About this society (rich text)            │
├───────────────────────────────────────────┤
│ At a glance                               │
│  Members  ····  Founded  ····  Services   │
├───────────────────────────────────────────┤
│ Services offered  (chips)                 │
├───────────────────────────────────────────┤
│ Management committee (names + offices)    │
├───────────────────────────────────────────┤
│ Contact  ·  Website  ·  Address           │
├───────────────────────────────────────────┤
│ Other cooperatives in [State]             │
└───────────────────────────────────────────┘
```

- Any field the society has not supplied is omitted entirely. No "N/A", no zero-value stats.
- `Organization` JSON-LD per profile.
- Share row: copy link, WhatsApp, X. WhatsApp share matters most for this audience — put it first.

---

## 13. The Cooperative Map of Nigeria

The most technically demanding piece. Build it as an isolated, dynamically imported client island.

### 13.1 What it must do

- Render all **36 states + the FCT** from local TopoJSON (`src/data/nigeria-states.json`). Never fetch geography from a third party at runtime.
- Colour each state by its **verified count of registered/member cooperatives**, in five bands from `--cord-soft` to `--cord`, with the top band in `--brass`.
- **States with no verified data are rendered in a neutral hatch fill**, are excluded from the legend bands, and show "No verified figure yet" on hover. They are never coloured as zero, because unknown is not zero.
- Interactive state selection — click/tap selects a state, which highlights it, pins the info panel, and reveals the CTA **"View cooperatives in [State] →"** to `/cooperatives/state/[state]`.
- Hover (pointer) / tap (touch) shows: state name, cooperative count, share of national total, top MDA present.
- A synchronised, sortable **state table** beside the map (below it on mobile) — this is the accessible equivalent and the primary interface on small screens.
- Filter the map by MDA category and by service type; the bands recalculate.
- A total strip: "156 cooperatives across 24 states with verified data."

```
                 COOPERATIVE MAP
                   OF NIGERIA

       [ Interactive Nigeria Map ]

   ┌───────────────────────────────┐
   │ Lagos             18          │
   │ Rivers             9          │
   │ Kaduna            12          │
   │ FCT               24          │
   │ Enugu              7          │
   │ ...                           │
   └───────────────────────────────┘

        Explore Cooperatives →
```

### 13.2 Data integrity — mandatory

The counts are **database-driven and must never be fabricated, estimated, interpolated or seeded with placeholder numbers.** During development, seed the database with clearly-labelled test data and ship with real data only. A state's figure is rendered only when a Convex `stateStats` record exists with `verified: true` and a `verifiedAt` timestamp. Show "Figures last verified {date}" beneath the map.

### 13.3 Mobile interaction

- The map scales to fit width; minimum practical height 380px.
- Pinch-zoom and pan via `react-simple-maps`' `ZoomableGroup`, with a reset button.
- Tap a state → the info panel slides up as a bottom `Sheet` rather than a floating tooltip; tooltips are unusable on touch.
- Below the map, the state table is the default way to read the data: sortable, searchable, with the same CTA per row.
- Never require a hover to reach information.

### 13.4 Accessibility

- Each state `<path>` gets `role="button"`, `tabIndex={0}`, an `aria-label` of "Kaduna, 12 cooperative societies. View cooperatives in Kaduna", and Enter/Space activation.
- Arrow keys move between states in the table; the table and the map share a single selected-state state object.
- Colour is never the only carrier of meaning — the count is always available as text.
- Focus ring in `--brass`, 2px offset, visible in both themes.

### 13.5 Performance

- `next/dynamic` with `ssr: false` and a skeleton the same height as the map, so there is no CLS.
- The TopoJSON is simplified to ≤ 60KB before it ships. Run `mapshaper` at build time, commit the simplified file.
- The map component and `d3-geo`/`topojson-client` must be in their own chunk, loaded only on `/cooperatives/map`.
- Counts arrive from a single Convex query returning a `Record<stateCode, number>` — 37 entries, cached.

### 13.6 Integration with the directory

Selecting a state anywhere on the site (map, table, profile page, filter) leads to the same `/cooperatives/state/[state]` route, and the directory's state filter reads its initial value from the URL. One concept, one route.

### 13.7 Site search (`⌘K` and `/search`)

`cmdk` palette indexing cooperatives, MDAs, states, news, events and pages. Index is a static JSON built at revalidation time and fetched once on first open — not a server round-trip per keystroke.

---

## 14. Gallery

### 14.1 The requirement

**The gallery must support both portrait and landscape photography.** Do not force every image into one fixed aspect ratio. Use an intelligent, responsive masonry-style layout that preserves each image's original composition.

Supported ratios:

```text
Portrait      Landscape     Square
3:4           16:9          1:1
4:5           3:2
2:3           4:3
```

### 14.2 Layout

- CSS Grid masonry: `grid-template-columns` with `grid-auto-rows: 8px` and a computed `grid-row-end: span N` per item derived from its stored `width`/`height`. This works everywhere today; progressively upgrade to native `masonry` behind `@supports` when available.
- Each tile sets `aspect-ratio` from image metadata stored at upload. No fixed-height tiles.
- `object-fit: cover` is used **only** where an editorial crop is intentional (album covers, the hero collage) — never on gallery items themselves, which use `object-fit: contain` within their own ratio box.
- Columns: 1 (mobile) → 2 (`sm`) → 3 (`lg`) → 4 (`xl`), with a gap of 12px mobile, 20px desktop.
- Desktop composition should read editorially — tall portraits anchoring the outer columns, landscapes spanning the centre:

```text
┌──────────────┬──────────┬──────────────┐
│              │          │              │
│   Portrait   │Landscape │   Portrait   │
│              │          │              │
├──────────────┤          ├──────────────┤
│              │          │              │
│  Landscape   │          │  Landscape   │
│              │          │              │
└──────────────┴──────────┴──────────────┘
```

- On mobile it collapses to a **single-column visual story**: full-width images at their natural ratio, one after another, with the caption beneath. Portrait images are **not** shrunk to fit a uniform tile — they are allowed their full height. Interleave a section title every 6–8 images so the column has rhythm.

### 14.3 Lightbox

- Fullscreen viewing, `--paper` at 96% opacity backdrop with a blur.
- Previous / next navigation: on-screen buttons, arrow keys, and swipe (`embla` or a pointer-event handler).
- Caption, event/category, and date displayed beneath the image.
- Escape closes; focus is trapped while open; focus returns to the originating tile on close.
- Preload the adjacent two images only.
- Deep-linkable: `?photo=<id>` so a single image can be shared.

### 14.4 Delivery

- All images through **Cloudinary** with `f_auto,q_auto:good,dpr_auto` and explicit `c_limit` widths.
- `next-cloudinary`'s `CldImage`, or a custom Next `loader` pointing at Cloudinary. **Do not use Vercel's image optimizer** — it is a real Active-CPU cost and Cloudinary already does the work (see §16).
- `sizes` set correctly per breakpoint. `loading="lazy"` on everything below the first row; `priority` on the first two only.
- LQIP: store a Cloudinary-generated base64 blur at upload, use as `placeholder="blur"`.
- Every image requires alt text at upload. The admin form **blocks publishing without it.**

### 14.5 Structure

- `/gallery` — album grid, each album showing a 4-image mosaic cover, title, date, photo count.
- `/gallery/[album]` — the masonry grid for that album, with a filter row for category (AGM, Training, Peer Review, Advocacy, Investment, Partnerships, Community).
- Reveal animation: `<Stagger>` at 40ms per item, first viewport only, disabled under reduced motion.

---

## 15. News, Events, Resources, Contact

### 15.1 `/news` and `/news/[slug]`

Card grid, filter by pillar tag and year, search. Article page: hero image, title, date, author, reading time, rich-text body with a max 680px column, share row, related articles. `NewsArticle` JSON-LD. `generateStaticParams` + ISR.

### 15.2 `/events` and `/events/[slug]`

Split into "Upcoming" and "Past" tabs. Upcoming events show a live countdown (client-side only), venue, date/time in WAT, and an "Add to calendar" `.ics` download generated **client-side** — no server function. Past events link to their gallery album and any resources. `Event` JSON-LD.

RSVP: a lightweight interest form writing to Convex (name, cooperative, email, phone, number attending). Confirmation on screen and by email.

### 15.3 `/resources`

Downloads centre: bye-law templates, governance guides, annual reports, peer review checklists, training materials. Table with title, category, file type, size, updated date. Files hosted on Cloudinary/Convex storage and served directly — never proxied through a Next route handler.

### 15.4 `/contact` — the single intake point

**All membership enquiries flow through this page.** There is no separate membership application system.

The form must include a selectable enquiry category:

```text
Membership Enquiry
General Enquiry
Partnership
Training
Peer Review
Investment
Cooperative Directory
Other
```

- The category is preselectable from the URL: `/contact?category=membership` selects "Membership Enquiry" and scrolls to the form. Every CTA across the site uses this pattern.
- **Base fields (all categories):** full name, email, phone, subject, message, consent checkbox.
- **When category = Membership Enquiry, the form additionally requests:**
  - Cooperative society name
  - MDA
  - Contact person
  - Email address
  - Phone number
  - Message

  Reveal these conditionally with a smooth height animation (`framer-motion` `AnimatePresence` + `height: auto`), and register/unregister them in the Zod schema so validation matches what is visible.
- Validation: `react-hook-form` + `zod`, inline errors beneath each field, error text that says what to do ("Enter a phone number we can reach you on").
- Spam: honeypot field + timestamp check + Cloudflare Turnstile. No arithmetic captchas.
- Submission writes to Convex `enquiries` and triggers an email via a Convex action (Resend). Keep the email send in Convex, not in a Next route handler, so Vercel does no work.
- Success is an in-place state change, not a redirect: the form is replaced by a confirmation card reading "Enquiry sent. FEDCOOP will respond to {email} within two working days." Plus a `sonner` toast "Enquiry sent."
- Alongside the form: the address block, phone, email, office hours, an embedded map of the Federal Secretariat Complex (lazy-loaded `iframe`, `loading="lazy"`, only after user interaction or intersection), and the three social links.

### 15.5 `/privacy`, `/terms`, `not-found.tsx`

404 is branded: a frayed cord illustration, the line "This page isn't part of the federation.", and three useful links — Home, Member Cooperatives, Contact. No humour beyond that one line.

---

## 16. Convex data model

```ts
// convex/schema.ts
export default defineSchema({
  cooperatives: defineTable({
    name: v.string(),
    slug: v.string(),
    acronym: v.optional(v.string()),
    aliases: v.array(v.string()),          // for MDA search matching
    mda: v.string(),
    mdaCategory: v.union(v.literal("ministry"), v.literal("department"),
                         v.literal("agency"), v.literal("parastatal")),
    stateCode: v.string(),                  // "NG-KD" … "NG-FC"
    city: v.optional(v.string()),
    address: v.optional(v.string()),
    about: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    foundedYear: v.optional(v.number()),
    affiliatedYear: v.optional(v.number()),
    membershipBand: v.optional(v.string()), // "under 500", "500–2,000", …
    services: v.array(v.string()),
    committee: v.optional(v.array(v.object({ name: v.string(), office: v.string() }))),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
    isVerified: v.boolean(),
    isPublished: v.boolean(),
    order: v.optional(v.number()),
  }).index("by_slug", ["slug"])
    .index("by_state", ["stateCode"])
    .index("by_mda", ["mda"])
    .searchIndex("search_name", { searchField: "name", filterFields: ["stateCode", "mdaCategory"] }),

  stateStats: defineTable({
    stateCode: v.string(),
    stateName: v.string(),
    cooperativeCount: v.optional(v.number()),  // undefined ⇒ no verified figure
    verified: v.boolean(),
    verifiedAt: v.optional(v.number()),
    note: v.optional(v.string()),
  }).index("by_state", ["stateCode"]),

  siteStats: defineTable({                      // home page impact numbers
    key: v.string(),                            // "memberSocieties" | "membersRepresented" | …
    value: v.optional(v.number()),
    label: v.string(),
    verified: v.boolean(),
    verifiedAt: v.optional(v.number()),
  }).index("by_key", ["key"]),

  directors: defineTable({
    name: v.string(), office: v.string(), cooperative: v.optional(v.string()),
    mda: v.optional(v.string()), bio: v.optional(v.string()),
    photoUrl: v.optional(v.string()), isExecutive: v.boolean(), order: v.number(),
    isPublished: v.boolean(),
  }).index("by_order", ["order"]),

  posts: defineTable({                          // news
    title: v.string(), slug: v.string(), excerpt: v.string(), body: v.string(),
    coverUrl: v.optional(v.string()), coverAlt: v.optional(v.string()),
    pillars: v.array(v.string()), author: v.optional(v.string()),
    publishedAt: v.number(), isPublished: v.boolean(),
  }).index("by_slug", ["slug"]).index("by_published", ["isPublished", "publishedAt"]),

  events: defineTable({
    title: v.string(), slug: v.string(), summary: v.string(), body: v.string(),
    startsAt: v.number(), endsAt: v.optional(v.number()),
    venue: v.string(), city: v.string(), coverUrl: v.optional(v.string()),
    pillars: v.array(v.string()), albumId: v.optional(v.id("albums")),
    rsvpEnabled: v.boolean(), isPublished: v.boolean(),
  }).index("by_slug", ["slug"]).index("by_start", ["startsAt"]),

  rsvps: defineTable({
    eventId: v.id("events"), name: v.string(), cooperative: v.string(),
    email: v.string(), phone: v.string(), attendees: v.number(), createdAt: v.number(),
  }).index("by_event", ["eventId"]),

  albums: defineTable({
    title: v.string(), slug: v.string(), description: v.optional(v.string()),
    category: v.string(), date: v.number(), coverPhotoIds: v.array(v.id("photos")),
    isPublished: v.boolean(),
  }).index("by_slug", ["slug"]),

  photos: defineTable({
    albumId: v.id("albums"),
    publicId: v.string(),                       // Cloudinary
    width: v.number(), height: v.number(),      // drives masonry span + aspect-ratio
    orientation: v.union(v.literal("portrait"), v.literal("landscape"), v.literal("square")),
    blurDataUrl: v.optional(v.string()),
    alt: v.string(),                            // required — publish is blocked without it
    caption: v.optional(v.string()),
    category: v.optional(v.string()),
    takenAt: v.optional(v.number()),
    order: v.number(),
  }).index("by_album", ["albumId", "order"]),

  resources: defineTable({
    title: v.string(), description: v.optional(v.string()), category: v.string(),
    fileUrl: v.string(), fileType: v.string(), fileSize: v.number(),
    updatedAt: v.number(), isPublished: v.boolean(),
  }).index("by_category", ["category"]),

  enquiries: defineTable({
    category: v.union(
      v.literal("membership"), v.literal("general"), v.literal("partnership"),
      v.literal("training"), v.literal("peer-review"), v.literal("investment"),
      v.literal("directory"), v.literal("other")),
    fullName: v.string(), email: v.string(), phone: v.optional(v.string()),
    subject: v.optional(v.string()), message: v.string(),
    // membership-only
    cooperativeName: v.optional(v.string()), mda: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
    status: v.union(v.literal("new"), v.literal("in-progress"), v.literal("closed")),
    createdAt: v.number(),
  }).index("by_status", ["status", "createdAt"]),

  subscribers: defineTable({ email: v.string(), createdAt: v.number(), confirmed: v.boolean() })
    .index("by_email", ["email"]),

  pages: defineTable({ key: v.string(), title: v.string(), body: v.string(), updatedAt: v.number() })
    .index("by_key", ["key"]),                  // mission, vision, about, values, history…
});
```

Every public query must filter `isPublished === true` at the database level, not in the component.

---

## 17. Admin CMS (`/admin`)

Protected by Convex Auth with role-based access (`admin`, `editor`). `proxy.ts` guards `/admin/*` and returns a redirect for unauthenticated requests — nothing heavier.

Modules: Dashboard (enquiry counts by status, recent activity) · Cooperatives · State statistics · Site statistics · Directors · News · Events + RSVPs · Gallery albums & photos · Resources · Enquiries inbox · Pages · Subscribers.

Requirements:

- **State statistics screen** shows all 37 rows with an explicit "Verified" switch and a `verifiedAt` stamp. A count cannot be saved without ticking verified. Unverified rows publish as "no figure available" — this is what enforces §13.2 in practice.
- Photo upload: drag-and-drop to Cloudinary, automatic capture of width/height/orientation, mandatory alt text, reorderable grid.
- Rich text: a small Tiptap-based editor. Headings, bold, italic, lists, links, blockquote, image. Nothing more.
- Enquiries inbox: filter by category and status, mark in-progress/closed, copy the enquirer's details, add an internal note.
- Every mutation revalidates the relevant cache tag (`revalidateTag("cooperatives")`, etc.).
- The admin is a client-side app talking to Convex directly. It does **no** SSR beyond the shell, which keeps it entirely off the Vercel CPU meter.

---

## 18. Vercel Fluid — Active CPU budget

Fluid compute bills **Active CPU**, not wall-clock time. The goal is a cinematic site that spends almost nothing on the server: all the spectacle runs on the visitor's GPU, and Vercel mostly serves bytes from cache.

> If the intent was the opposite — deliberately consuming Active CPU — say so and this section gets rewritten. As written, everything below drives Active CPU toward zero while keeping the site fully dynamic where it matters.

**Rules:**

1. **Static-first.** Every public page is statically rendered or ISR'd. `generateStaticParams` for all cooperative profiles, state pages, news, events and albums. Nothing on the public site is `force-dynamic`.
2. **Tag-based revalidation, not time-based polling.** Convex mutations call `revalidateTag`. Set `revalidate` fallbacks generously (3600s+), never 0, never 10.
3. **Enable Fluid compute** with Node runtime and in-function concurrency, so idle I/O time is not billed and one instance serves many requests.
4. **Real-time reads happen on Convex, not Vercel.** Live counts on the map and directory use Convex's client subscription. Vercel serves the static shell; the data streams from Convex. Zero function invocations for interactivity.
5. **No Vercel Image Optimization.** Configure a Cloudinary `loader` in `next.config.ts`. Image transformation is the single biggest avoidable CPU cost on a photo-heavy site.
6. **No server-side animation, no server-side markdown rendering at request time.** Serialise rich text at write time in the admin and store the rendered HTML.
7. **OG images:** generate with `ImageResponse` in a route with a long `revalidate` (e.g. 86400) so each is computed once, or pre-render at build. Never per request.
8. **`after()`** for anything non-blocking (analytics pings, audit writes) so the response is not held open.
9. **Streaming + Suspense** around any data-dependent block so the shell flushes immediately and the function idles rather than burns CPU.
10. **No middleware work.** `proxy.ts` does header setting and an admin auth check. That's it — it runs on every request, so anything expensive there is multiplied by all traffic.
11. **Client bundle discipline** (this is CPU on the user's phone, which matters just as much): `LazyMotion`+`domAnimation`, dynamic import of the map, gallery lightbox and Tiptap, `content-visibility: auto` on below-fold sections, and a route-level JS budget of **≤ 180KB gzipped** on every public page.

**Performance targets (mobile, Moto G-class, 4G):** LCP ≤ 2.0s · INP ≤ 200ms · CLS ≤ 0.02 · Lighthouse ≥ 95 on all four categories.

---

## 19. SEO, accessibility, security

**SEO**

- `generateMetadata` per route: title, description, canonical, OG and Twitter cards. Title template `%s | FEDCOOP`.
- Structured data: `Organization` (site-wide, with `sameAs` for the three social profiles), `BreadcrumbList`, `NewsArticle`, `Event`, `FAQPage`, and `Organization` per cooperative profile.
- `sitemap.ts` includes every cooperative, state, article, event and album. `robots.ts` allows all, disallows `/admin`.
- Semantic HTML: one `h1` per page, correct heading order, `<nav>`, `<main>`, `<article>`, `<address>`.
- Keyword ground truth, used naturally in copy — not stuffed: federal cooperative societies Nigeria, MDA staff cooperative, cooperative society Abuja, FEDCOOP membership, cooperative directory Nigeria.

**Accessibility — WCAG 2.2 AA**

- Visible focus in `--brass`, 2px, 2px offset, on every interactive element in both themes.
- Full keyboard operation, including the map, the lightbox, the mega menu and the mobile sheet.
- Skip-to-content link as the first focusable element.
- All interactive targets ≥ 44×44px on touch.
- `prefers-reduced-motion` honoured globally, including the cord and the marquee.
- Form errors announced via `aria-live="polite"`, associated with `aria-describedby`.
- Contrast checked in both themes for every token pairing.

**Security & privacy**

- Security headers in `proxy.ts`: CSP (allow Cloudinary, Convex, Google Fonts), `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.
- Rate-limit enquiry and RSVP mutations in Convex by IP hash.
- NDPR-aligned privacy notice; the contact form's consent checkbox is unticked by default and is required.
- No third-party analytics that sets cookies without consent. Use Vercel Analytics (cookieless).

---

## 20. Build order

Ship in this sequence; each phase should end in a deployable state.

1. **Foundation** — bootstrap, Nunito, tokens in `globals.css`, `@theme inline`, next-themes, `proxy.ts`, Convex init and schema, layout shell.
2. **The Cord** — motion primitives, `ScrollCord`, mobile progress bar, reduced-motion handling. Verify at 60fps on a mid-range Android before continuing.
3. **Header, mega menu, mobile sheet, footer, theme toggle, 404.**
4. **Home** — all nine sections against seeded data.
5. **Convex data layer** — queries, mutations, cache tags, seed script with clearly-labelled test data.
6. **Member Cooperatives** — directory, MDA search, profile pages, state pages.
7. **The Map** — geography, bands, unverified handling, mobile sheet, table, accessibility pass.
8. **Membership** — Become a Member, Benefits.
9. **Contact** — the full enquiry system with conditional membership fields, Convex action, email.
10. **Media** — News, Events, Gallery masonry + lightbox.
11. **About, Leadership, What We Do, Resources.**
12. **Admin CMS.**
13. **SEO, structured data, sitemap, OG images.**
14. **Audit** — Lighthouse, axe, keyboard-only run-through, both themes, real device test, Active-CPU review in the Vercel dashboard.

---

## 21. Assets and content still needed from FEDCOOP

Build against placeholders, but track these:

- [ ] Logo — SVG, light and dark variants, plus favicon and 512px PWA icons
- [ ] Official mission and vision statements
- [ ] Verified cooperative register: name, MDA, state, services, contacts
- [ ] Verified per-state cooperative counts, with a verification date
- [ ] Verified national figures for the impact band
- [ ] Board of Directors: portraits, names, offices, bios
- [ ] Event photography for the gallery, in both orientations, with captions and dates
- [ ] Testimonial quotes with attribution and consent
- [ ] Downloadable resources (bye-law templates, reports, checklists)
- [x] Confirmed public email — `email@fedcoop.org`
- [ ] Privacy policy and terms content, reviewed by FEDCOOP

---

## 22. Definition of done

- [ ] Renders correctly from 320px to 2560px; no horizontal scroll at any width
- [ ] Light and dark themes both complete; no flash on load; no unstyled or invisible element in either
- [ ] Every number on the site traces to a Convex record; no hard-coded statistic anywhere in the codebase
- [ ] States without verified data show "no figure available" everywhere they appear
- [ ] There is no membership application form; all membership CTAs land on `/contact?category=membership` with the category preselected
- [ ] The gallery preserves portrait, landscape and square compositions and collapses to a single-column story on mobile
- [ ] Every image has meaningful alt text
- [ ] Full keyboard operation, including the map and lightbox
- [ ] `prefers-reduced-motion` produces a completely static, fully usable site
- [ ] Lighthouse ≥ 95 across the board on mobile
- [ ] No `force-dynamic` on any public route; Vercel function invocations sit near zero in normal browsing
- [ ] `proxy.ts` is used; there is no `middleware.ts` in the repository
