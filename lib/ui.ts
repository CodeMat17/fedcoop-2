import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";

export { cn };

/** Button styles for non-button elements (links). Real buttons use <Button> from components/ui. */
export const btn = {
  primary: buttonVariants({ variant: "default" }),
  secondary: buttonVariants({ variant: "secondary" }),
  ghost: buttonVariants({ variant: "ghost" }),
  onCord: buttonVariants({ variant: "onCord" }),
};

export const card =
  "rounded-card border border-cord-line bg-paper-raise transition-[border-color,box-shadow,transform,background-color] duration-300 ease-out";

export const link = "font-semibold text-cord underline-offset-4 hover:underline";

export const input =
  "block min-h-11 w-full rounded-chip border border-cord-line bg-paper-raise px-3 py-2 text-ink placeholder:text-ink-muted/70 aria-[invalid=true]:border-danger";

export const label = "mb-1.5 block text-[0.9rem] font-bold text-ink";

export const chip =
  "inline-flex items-center rounded-chip border border-cord-line px-2 py-0.5 t-meta text-ink-muted";
