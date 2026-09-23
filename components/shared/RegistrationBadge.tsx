import { BadgeCheck, CircleDashed } from "lucide-react";
import { cn } from "@/lib/ui";

/** "Registered" / "Not registered" pill. Not registered is the default for any society without the flag. */
export function RegistrationBadge({ registered, className }: { registered?: boolean; className?: string }) {
  return registered ? (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border border-cord/25 bg-cord-soft px-2.5 py-0.5 t-meta whitespace-nowrap text-cord",
        className,
      )}
    >
      <BadgeCheck className="size-3.5" strokeWidth={2} aria-hidden="true" />
      Registered
    </span>
  ) : (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border border-dashed border-ink-muted/35 px-2.5 py-0.5 t-meta whitespace-nowrap text-ink-muted",
        className,
      )}
    >
      <CircleDashed className="size-3.5" strokeWidth={2} aria-hidden="true" />
      Not registered
    </span>
  );
}
