import Image from "next/image";
import Link from "next/link";
import { SOCIALS } from "@/lib/site";
import { cn } from "@/lib/ui";

/**
 * The badge is a round mark on a transparent ground with its own white disc,
 * so it reads on both paper and dark paper without a separate variant.
 */
export function Logo({ className, size = 60 }: { className?: string; size?: number }) {
  return (
    <Link href="/" className={cn("inline-flex min-h-11 items-center gap-2.5 text-ink", className)} aria-label="FEDCOOP home">
      <Image src="/logo-2.webp" alt="" width={size} height={size} unoptimized priority className="rounded-full" />
      <span className="text-[1.35rem] font-black tracking-[-0.03em]">FEDCOOP</span>
    </Link>
  );
}

const paths: Record<(typeof SOCIALS)[number]["name"], string> = {
  Facebook:
    "M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.6c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2H8.2v3.2h2.6V20H14v-8.3h2.6l.4-3.2H14Z",
  X: "M13.9 10.2 20.4 3h-1.6l-5.6 6.2L8.8 3H3.5l6.8 9.7L3.5 20.3h1.6l5.9-6.6 4.7 6.6h5.3l-7.1-10.1Zm-2.1 2.4-.7-1L5.6 4.2h2.4l4.4 6.2.7 1 5.7 8H16.4l-4.6-6.8Z",
  Instagram:
    "M12 7.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2Zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm5.9-7.8a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM21 8.3c-.1-1.4-.4-2.7-1.5-3.8S17.1 3.1 15.7 3c-1.5-.1-5.9-.1-7.4 0-1.4.1-2.7.4-3.8 1.5S3.1 6.9 3 8.3c-.1 1.5-.1 5.9 0 7.4.1 1.4.4 2.7 1.5 3.8s2.4 1.4 3.8 1.5c1.5.1 5.9.1 7.4 0 1.4-.1 2.7-.4 3.8-1.5s1.4-2.4 1.5-3.8c.1-1.5.1-5.9 0-7.4Zm-1.9 9.2a3 3 0 0 1-1.7 1.7c-1.2.5-3.9.4-5.4.4s-4.2.1-5.4-.4a3 3 0 0 1-1.7-1.7c-.5-1.2-.4-3.9-.4-5.5s-.1-4.2.4-5.4a3 3 0 0 1 1.7-1.7c1.2-.5 3.9-.4 5.4-.4s4.2-.1 5.4.4a3 3 0 0 1 1.7 1.7c.5 1.2.4 3.9.4 5.4s.1 4.3-.4 5.5Z",
};

export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={cn("flex items-center gap-1", className)}>
      {SOCIALS.map((s) => (
        <li key={s.name}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`FEDCOOP on ${s.name}`}
            className="grid size-11 place-items-center rounded-chip text-ink-muted transition-colors hover:bg-cord-soft hover:text-cord"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
              <path d={paths[s.name]} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
