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
        crumbs={[{ label: "Contact", href: "/contact" }]}
        standfirst="All enquiries, including membership, come through this page. Choose a category and the secretariat will route your message to the right desk."
      />
      <div className="shell grid gap-14 pb-24 lg:grid-cols-12">
        <section id="enquiry" aria-labelledby="enquiry-h" className="lg:col-span-7">
          <h2 id="enquiry-h" className="t-section mb-6">Send an enquiry</h2>
          <Suspense fallback={<div className="h-[640px]" />}>
            <ContactForm />
          </Suspense>
        </section>

        <aside className="space-y-8 lg:col-span-5">
          <div>
            <h2 className="t-card mb-3">Secretariat</h2>
            <address className="space-y-1 not-italic">
              {SITE.address.map((l) => (
                <span key={l} className="block">{l}</span>
              ))}
            </address>
          </div>
          <ul className="space-y-1">
            <li>
              <a href={SITE.phoneHref} className="inline-flex min-h-11 items-center gap-3 font-semibold hover:text-cord">
                <Phone className="size-5 text-cord" strokeWidth={1.5} aria-hidden="true" /> {SITE.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="inline-flex min-h-11 items-center gap-3 font-semibold hover:text-cord">
                <Mail className="size-5 text-cord" strokeWidth={1.5} aria-hidden="true" /> {SITE.email}
              </a>
            </li>
            <li className="flex min-h-11 items-center gap-3 text-ink-muted">
              <Clock className="size-5 text-cord" strokeWidth={1.5} aria-hidden="true" /> {SITE.hours}
            </li>
          </ul>
          <LazyMap />
          <div>
            <h2 className="t-card mb-2">Follow FEDCOOP</h2>
            <SocialLinks className="-ml-3" />
          </div>
        </aside>
      </div>
    </>
  );
}
