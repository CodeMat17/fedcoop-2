import Link from "next/link";
import { btn } from "@/lib/ui";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="shell pt-32 pb-24 md:pt-44">
      <svg viewBox="0 0 320 120" className="mb-10 h-24 w-auto text-cord" fill="none" aria-hidden="true">
        <path d="M0 60c40-20 80 20 120 0" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M120 60c14-6 22-18 38-30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity=".8" />
        <path d="M120 60c16 0 28 6 44 4" stroke="var(--brass)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M120 60c12 8 20 22 34 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity=".5" />
        <path d="M196 30c10-4 20-2 30 2M200 70c14 2 24 0 36-6M190 96c12 4 22 2 34-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 8" opacity=".4" />
      </svg>
      <h1 className="t-title max-w-[20ch]">This page isn&apos;t part of the federation.</h1>
      <p className="t-lead mt-5 max-w-[44ch] text-ink-muted">The link may be out of date. These pages will get you back on track.</p>
      <ul className="mt-10 flex flex-wrap gap-3">
        <li><Link href="/" className={btn.primary}>Home</Link></li>
        <li><Link href="/cooperatives" className={btn.secondary}>Member Cooperatives</Link></li>
        <li><Link href="/contact" className={btn.secondary}>Contact</Link></li>
      </ul>
    </div>
  );
}
