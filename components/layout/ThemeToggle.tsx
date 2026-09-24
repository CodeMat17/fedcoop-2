"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/ui";

const subscribe = () => () => {};
const icon = "col-start-1 row-start-1 size-5 transition-[rotate,opacity] duration-200";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const dark = mounted && resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      role="switch"
      aria-checked={dark}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={cn(
        "relative grid size-11 place-items-center rounded-chip text-ink transition-colors hover:bg-cord-soft",
        className,
      )}
    >
      {/* Both icons share one grid cell; the outgoing one turns away as the other turns in. */}
      <Sun className={cn(icon, dark ? "rotate-180 opacity-0" : "rotate-0 opacity-100")} strokeWidth={1.5} aria-hidden="true" />
      <Moon className={cn(icon, dark ? "rotate-0 opacity-100" : "-rotate-180 opacity-0")} strokeWidth={1.5} aria-hidden="true" />
    </Button>
  );
}
