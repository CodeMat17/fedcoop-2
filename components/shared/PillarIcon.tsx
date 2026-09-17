import { ClipboardCheck, GraduationCap, Handshake, Megaphone, Network, TrendingUp, type LucideProps } from "lucide-react";
import type { PillarSlug } from "@/lib/site";

const ICONS = {
  cooperation: Handshake,
  collaboration: Network,
  advocacy: Megaphone,
  "peer-review": ClipboardCheck,
  training: GraduationCap,
  investment: TrendingUp,
} satisfies Record<PillarSlug, React.ComponentType<LucideProps>>;

export function PillarIcon({ slug, ...props }: { slug: PillarSlug } & LucideProps) {
  const Icon = ICONS[slug];
  return <Icon strokeWidth={1.5} aria-hidden="true" {...props} />;
}
