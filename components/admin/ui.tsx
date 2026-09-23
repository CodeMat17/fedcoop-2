"use client";

import Link from "next/link";
import { ConvexError } from "convex/values";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PILLARS } from "@/lib/site";
import { card, cn } from "@/lib/ui";

/* Small building blocks shared by every admin screen. */

export function errorMessage(error: unknown) {
  if (error instanceof ConvexError) return String(error.data);
  // Client-side errors (uploads, validation) carry a readable message; raw
  // Convex server errors do not, so they get a generic line instead.
  if (error instanceof Error && error.message && !error.message.includes("[CONVEX")) return error.message;
  return "Something went wrong. Check your connection and try again.";
}

/** Runs a mutation/action with a pending flag and a toast for the outcome. */
export function useRun() {
  const [pending, setPending] = useState(false);
  const run = useCallback(async <T,>(task: () => Promise<T>, success?: string): Promise<T | undefined> => {
    setPending(true);
    try {
      const result = await task();
      if (success) toast.success(success);
      return result;
    } catch (error) {
      toast.error(errorMessage(error));
      return undefined;
    } finally {
      setPending(false);
    }
  }, []);
  return { run, pending };
}

export function PageHead({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-cord-line pb-6">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="t-meta mb-3 inline-flex items-center gap-1.5 font-semibold text-ink-muted hover:text-cord">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            {back.label}
          </Link>
        )}
        <h1 className="text-[1.75rem] leading-tight font-black tracking-[-0.03em] md:text-[2rem]">{title}</h1>
        {description && <p className="mt-1.5 max-w-[70ch] text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({
  title,
  description,
  children,
  className,
  actions,
}: {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <section className={cn(card, "p-5 md:p-6", className)}>
      {(title || actions) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-[1.05rem] font-extrabold tracking-[-0.01em]">{title}</h2>}
            {description && <p className="mt-1 text-[0.9rem] text-ink-muted">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({
  label,
  hint,
  htmlFor,
  required,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[0.88rem] font-bold text-ink">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[0.82rem] text-ink-muted">{hint}</p>}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="group flex w-full items-start gap-3 rounded-chip text-left disabled:opacity-50"
    >
      <span
        className={cn(
          "relative mt-0.5 inline-flex h-6 w-10 shrink-0 rounded-full border transition-colors",
          checked ? "border-cord bg-cord" : "border-cord-line bg-cord-soft",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-4.5 rounded-full bg-paper-raise shadow transition-transform",
            checked && "translate-x-4",
          )}
        />
      </span>
      <span>
        <span className="block font-bold">{label}</span>
        {description && <span className="block text-[0.85rem] text-ink-muted">{description}</span>}
      </span>
    </button>
  );
}

export function Status({ on, onLabel = "Published", offLabel = "Draft" }: { on: boolean; onLabel?: string; offLabel?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.78rem] font-bold",
        on ? "bg-cord-soft text-cord" : "bg-brass-soft text-brass",
      )}
    >
      <span className={cn("size-1.5 rounded-full", on ? "bg-cord" : "bg-brass")} />
      {on ? onLabel : offLabel}
    </span>
  );
}

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-cord-line px-6 py-14 text-center">
      <p className="font-extrabold">{title}</p>
      {children && <p className="mx-auto mt-1.5 max-w-[48ch] text-ink-muted">{children}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-16 text-ink-muted" role="status">
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      {label}…
    </div>
  );
}

/** Two-step destructive button: the first click arms it, the second confirms. */
export function ConfirmButton({
  onConfirm,
  label = "Delete",
  confirmLabel = "Confirm delete",
  size = "sm",
  disabled,
}: {
  onConfirm: () => void;
  label?: ReactNode;
  confirmLabel?: string;
  size?: "sm" | "default";
  disabled?: boolean;
}) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <Button
      type="button"
      size={size}
      variant={armed ? "destructive" : "ghost"}
      disabled={disabled}
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
          return;
        }
        setArmed(true);
        timer.current = setTimeout(() => setArmed(false), 4000);
      }}
    >
      {armed ? confirmLabel : label}
    </Button>
  );
}

export function SearchBox({ value, onChange, placeholder = "Search" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="relative block w-full max-w-xs">
      <span className="sr-only">{placeholder}</span>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block min-h-10 w-full rounded-chip border border-cord-line bg-paper-raise py-2 pr-3 pl-9 text-[0.95rem] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
      />
    </label>
  );
}

export function PillarPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PILLARS.map((p) => {
        const on = value.includes(p.slug);
        return (
          <Button
            key={p.slug}
            type="button"
            size="sm"
            variant="outline"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((x) => x !== p.slug) : [...value, p.slug])}
          >
            {p.name}
          </Button>
        );
      })}
    </div>
  );
}

/* Table styling (admin lists are plain tables; they scroll sideways on phones). */
export const table = {
  wrap: cn(card, "overflow-x-auto"),
  table: "w-full min-w-[640px] text-left text-[0.93rem]",
  th: "border-b border-cord-line px-4 py-3 text-[0.75rem] font-bold tracking-[0.08em] text-ink-muted uppercase",
  td: "border-b border-cord-line/60 px-4 py-3 align-middle",
  row: "transition-colors hover:bg-cord-soft/40",
};

/* <input type="datetime-local"> works in the browser's local time. */
export function toLocalInput(ms?: number) {
  if (ms === undefined) return "";
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export const fromLocalInput = (s: string) => (s ? new Date(s).getTime() : undefined);
export const toDateInput = (ms?: number) => toLocalInput(ms).slice(0, 10);
export const fromDateInput = (s: string) => (s ? new Date(`${s}T12:00`).getTime() : undefined);

/** Empty strings become undefined so optional Convex fields are cleared, not stored blank. */
export const opt = (s: string | undefined) => (s && s.trim() ? s.trim() : undefined);
export const optNum = (s: string) => (s.trim() === "" || Number.isNaN(Number(s)) ? undefined : Number(s));
export const list = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

/** Light clean-up while typing a slug; the server does the full slugify on save. */
export const slugInput = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
