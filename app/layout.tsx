import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/layout/Providers";
import { CommandSearch } from "@/components/layout/CommandSearch";
import { MobileProgress } from "@/components/cord/Cord";
import { JsonLd } from "@/components/shared/JsonLd";
import { PublicOnly } from "@/components/layout/PublicOnly";
import { OG_DEFAULTS, SITE, SOCIALS } from "@/lib/site";
import "./globals.css";

const sans = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

/* og:image / twitter:image come from app/opengraph-image.jpg (+ .alt.txt) via the file convention;
   setting `images` here would override it. og/twitter title and description are left unset so Next fills
   them from each page's own title and description. Pages that set their own `openGraph` use OG_DEFAULTS/OG_IMAGE. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `FEDCOOP — ${SITE.legalName}`, template: "%s | FEDCOOP" },
  description: SITE.description,
  applicationName: "FEDCOOP",
  keywords: [
    "FEDCOOP",
    "cooperative societies",
    "staff cooperatives",
    "federal civil service",
    "Nigeria cooperatives",
    "MDA cooperatives",
    "cooperative union",
    "Abuja",
  ],
  authors: [{ name: SITE.legalName, url: SITE.url }],
  creator: SITE.legalName,
  publisher: SITE.legalName,
  category: "Cooperatives",
  referrer: "origin-when-cross-origin",
  formatDetection: { email: false, address: false, telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: { ...OG_DEFAULTS, type: "website" },
  twitter: {
    card: "summary_large_image",
    site: "@FEDCOOP_ng",
    creator: "@FEDCOOP_ng",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F8F6" },
    { media: "(prefers-color-scheme: dark)", color: "#08110E" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-NG" className={sans.variable} suppressHydrationWarning>
      <body className="flex min-h-svh flex-col">
        <a
          href="#main"
          className="fixed top-2 left-2 z-[100] -translate-y-24 rounded-chip bg-cord px-4 py-3 font-bold text-paper focus:translate-y-0"
        >
          Skip to content
        </a>
        <Providers>
          <PublicOnly>
            {/* <Header /> */}
            <MobileProgress />
          </PublicOnly>
          <main id="main" className="relative flex-1">
            {children}
          </main>
          <PublicOnly>
            {/* <Footer /> */}
            <CommandSearch />
          </PublicOnly>
        </Providers>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: SITE.legalName,
            alternateName: SITE.name,
            url: SITE.url,
            email: SITE.email,
            telephone: "+2349162484000",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Federal Secretariat Complex, Phase 1",
              addressLocality: "Abuja",
              addressRegion: "FCT",
              addressCountry: "NG",
            },
            sameAs: SOCIALS.map((s) => s.href),
          }}
        />
      </body>
    </html>
  );
}
