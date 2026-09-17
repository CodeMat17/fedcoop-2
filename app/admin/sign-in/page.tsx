import type { Metadata } from "next";
import Link from "next/link";
import { btn } from "@/lib/ui";

export const metadata: Metadata = { title: "Admin sign-in", robots: { index: false, follow: false } };

export default function AdminSignIn() {
  return (
    <div className="shell pt-32 pb-24 md:pt-44">
      <h1 className="t-title">FEDCOOP admin</h1>
      <p className="t-lead mt-4 max-w-[48ch] text-ink-muted">
        The content management system is not connected yet. It needs Convex Auth to be configured for this deployment
        before editors can sign in.
      </p>
      <Link href="/" className={`${btn.secondary} mt-8`}>
        Back to the website
      </Link>
    </div>
  );
}
