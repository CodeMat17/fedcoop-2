import type { Metadata } from "next";
import { PageHero, Rich } from "@/components/shared/Page";
import { getPages } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Terms of use",
  description: "Terms for using the FEDCOOP website.",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const { terms } = await getPages(["terms"]);
  return (
    <>
      <PageHero title="Terms of use" crumbs={[{ label: "Terms", href: "/terms" }]} />
      <div className="shell pb-24">
        {terms ? (
          <Rich html={terms.body} />
        ) : (
          <div className="rich">
            <p><em>Draft pending review by FEDCOOP.</em></p>
            <h2>Using this website</h2>
            <p>This website gives information about FEDCOOP and its member cooperative societies. You may use and share its content for non-commercial purposes with credit to FEDCOOP.</p>
            <h2>Directory and figures</h2>
            <p>Directory entries are supplied by member societies. State and national figures are published only after FEDCOOP has verified them, and each shows the date it was last verified. FEDCOOP does not guarantee that third-party information is complete.</p>
            <h2>Membership</h2>
            <p>Nothing on this website is an offer of membership or investment. Affiliation follows FEDCOOP&apos;s review process and the decision of its governing bodies.</p>
            <h2>Links</h2>
            <p>Links to other websites are provided for convenience. FEDCOOP is not responsible for their content.</p>
          </div>
        )}
      </div>
    </>
  );
}
