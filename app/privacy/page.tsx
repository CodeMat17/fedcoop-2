import type { Metadata } from "next";
import { PageHero, Rich } from "@/components/shared/Page";
import { getPages } from "@/lib/data";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "How FEDCOOP collects and uses personal data submitted through this website.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const { privacy } = await getPages(["privacy"]);
  return (
    <>
      <PageHero title="Privacy notice" crumbs={[{ label: "Privacy", href: "/privacy" }]} standfirst="How FEDCOOP handles the personal data you give it through this website." />
      <div className="shell pb-24">
        {privacy ? (
          <Rich html={privacy.body} />
        ) : (
          <div className="rich">
            <p><em>Draft pending review by FEDCOOP.</em></p>
            <h2>Who we are</h2>
            <p>{SITE.legalName}, {SITE.address.join(", ")}. Contact: {SITE.email}.</p>
            <h2>What we collect</h2>
            <p>When you send an enquiry, register interest in an event or subscribe to updates, we collect the details you enter: your name, email address, phone number, cooperative society, MDA and message.</p>
            <h2>Why we collect it</h2>
            <p>To reply to your enquiry, plan events, and send updates you asked for. The lawful basis is your consent, given when you tick the consent box or subscribe, in line with the Nigeria Data Protection Act 2023.</p>
            <h2>Who we share it with</h2>
            <p>We do not sell personal data. It is stored with our database provider (Convex) and emails are sent through our email provider (Resend). Both process data on our instructions only.</p>
            <h2>How long we keep it</h2>
            <p>Enquiries are kept for up to three years after they are closed. You can unsubscribe from updates at any time.</p>
            <h2>Cookies and analytics</h2>
            <p>This website does not set advertising or tracking cookies. Visitor statistics are cookieless. Your theme choice is stored in your own browser.</p>
            <h2>Your rights</h2>
            <p>You can ask to see, correct or delete the personal data we hold about you by emailing {SITE.email}.</p>
          </div>
        )}
      </div>
    </>
  );
}
