import type { Metadata } from "next";
import { Suspense } from "react";
import { Clock, Mail, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { LazyMap } from "@/components/contact/LazyMap";
import { SocialLinks } from "@/components/layout/Brand";
import { PageHero } from "@/components/shared/Page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact FEDCOOP about membership, partnerships, training, peer review or investment. Federal Secretariat Complex, Abuja.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact FEDCOOP"
        eyebrow="Get in touch"
        crumbs={[{ label: "Contact", href: "/contact" }]}
        standfirst="All enquiries, including membership, come through this page. Choose a category and the secretariat will route your message to the right desk."
      />
      <div className="shell grid items-start gap-8 pb-24 lg:grid-cols-12 lg:gap-10">
        <section
          id="enquiry"
          aria-labelledby="enquiry-h"
          className="rounded-card border border-cord-line bg-paper-raise p-6 shadow-[0_30px_60px_-40px_rgb(16_26_23/0.35)] md:p-10 lg:col-span-7"
        >
          <p className="eyebrow mb-4">Write to us</p>
          <h2 id="enquiry-h" className="t-section mb-8">Send an enquiry</h2>
          <Suspense fallback={<div className="h-[640px]" />}>
            <ContactForm />
          </Suspense>
        </section>

        <aside className="dark space-y-8 overflow-hidden rounded-card bg-paper p-6 text-ink md:p-10 lg:sticky lg:top-28 lg:col-span-5">
          <div>
            <p className="eyebrow mb-4">Secretariat</p>
            <address className="space-y-0.5 text-[1.05rem] not-italic">
              {SITE.address.map((l) => (
                <span key={l} className="block">{l}</span>
              ))}
            </address>
          </div>
          <ul className="divide-y divide-cord-line border-y border-cord-line">
            <li>
              <a href={SITE.phoneHref} className="flex min-h-14 items-center gap-4 font-semibold transition-colors hover:text-cord">
                <span className="grid size-9 place-items-center rounded-full bg-cord-soft"><Phone className="size-4 text-cord" strokeWidth={1.5} aria-hidden="true" /></span>
                {SITE.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="flex min-h-14 items-center gap-4 font-semibold transition-colors hover:text-cord">
                <span className="grid size-9 place-items-center rounded-full bg-cord-soft"><Mail className="size-4 text-cord" strokeWidth={1.5} aria-hidden="true" /></span>
                {SITE.email}
              </a>
            </li>
            <li className="flex min-h-14 items-center gap-4 text-ink-muted">
              <span className="grid size-9 place-items-center rounded-full bg-cord-soft"><Clock className="size-4 text-cord" strokeWidth={1.5} aria-hidden="true" /></span>
              {SITE.hours}
            </li>
          </ul>
          <div className="overflow-hidden rounded-card">
            <LazyMap />
          </div>
          <div>
            <p className="eyebrow mb-3">Follow FEDCOOP</p>
            <SocialLinks className="-ml-3" />
          </div>
        </aside>
      </div>
    </>
  );
}
