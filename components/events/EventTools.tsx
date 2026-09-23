"use client";

import { Tabs } from "@base-ui/react/tabs";
import { CalendarPlus } from "lucide-react";
import { useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { callForm, formError } from "@/lib/convex-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EventTabs({ upcoming, past }: { upcoming: ReactNode; past: ReactNode }) {
  const tab =
    "inline-flex min-h-10 items-center rounded-full px-5 text-[0.93rem] font-semibold text-ink-muted transition-colors hover:text-ink data-[selected]:bg-cord data-[selected]:text-paper data-[selected]:shadow-sm";
  return (
    <Tabs.Root defaultValue="upcoming">
      <Tabs.List className="mb-10 inline-flex gap-1 rounded-full border border-cord-line bg-paper-raise p-1">
        <Tabs.Tab value="upcoming" className={tab}>Upcoming</Tabs.Tab>
        <Tabs.Tab value="past" className={tab}>Past</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="upcoming">{upcoming}</Tabs.Panel>
      <Tabs.Panel value="past">{past}</Tabs.Panel>
    </Tabs.Root>
  );
}

/** Live countdown, client-only so the static HTML never carries a stale value. */
const subscribeSeconds = (tick: () => void) => {
  const t = setInterval(tick, 1000);
  return () => clearInterval(t);
};
const currentSecond = () => Math.floor(Date.now() / 1000) * 1000;

export function Countdown({ to }: { to: number }) {
  const now = useSyncExternalStore(subscribeSeconds, currentSecond, () => null);
  if (now === null) return <div className="h-[4.5rem]" aria-hidden="true" />;
  const diff = Math.max(0, to - now);
  if (diff === 0) return <p className="font-bold text-cord">This event has started.</p>;
  const parts = [
    { v: Math.floor(diff / 86400000), l: "days" },
    { v: Math.floor(diff / 3600000) % 24, l: "hours" },
    { v: Math.floor(diff / 60000) % 60, l: "minutes" },
    { v: Math.floor(diff / 1000) % 60, l: "seconds" },
  ];
  return (
    <div role="timer" aria-live="off" className="flex gap-6">
      {parts.map((p) => (
        <div key={p.l}>
          <span className="tabular block text-[2rem] leading-none font-black text-cord">{String(p.v).padStart(2, "0")}</span>
          <span className="t-meta text-ink-muted">{p.l}</span>
        </div>
      ))}
    </div>
  );
}

const icsDate = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");

/** Builds the .ics in the browser; no server function (§15.2). */
export function AddToCalendar(props: { title: string; start: number; end?: number; location: string; description: string; url: string }) {
  const download = () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//FEDCOOP//Events//EN",
      "BEGIN:VEVENT",
      `UID:${props.start}-${props.url}`,
      `DTSTAMP:${icsDate(Date.now())}`,
      `DTSTART:${icsDate(props.start)}`,
      `DTEND:${icsDate(props.end ?? props.start + 2 * 3600000)}`,
      `SUMMARY:${esc(props.title)}`,
      `LOCATION:${esc(props.location)}`,
      `DESCRIPTION:${esc(props.description)}`,
      `URL:${props.url}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${props.title.replace(/[^\w]+/g, "-").toLowerCase()}.ics`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <Button type="button" variant="secondary" onClick={download}>
      <CalendarPlus className="size-4" strokeWidth={1.5} /> Add to calendar
    </Button>
  );
}

export function RsvpForm({ eventId }: { eventId: string }) {
  const started = useRef(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [email, setEmail] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v = Object.fromEntries(fd.entries()) as Record<string, string>;
    const next: Record<string, string> = {};
    if ((v.name ?? "").trim().length < 2) next.name = "Enter your full name";
    if ((v.cooperative ?? "").trim().length < 2) next.cooperative = "Enter your cooperative society";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email ?? "")) next.email = "Enter an email address for your confirmation";
    if (!/^[+\d][\d\s()-]{6,}$/.test(v.phone ?? "")) next.phone = "Enter a phone number we can reach you on";
    const n = Number(v.attendees);
    if (!Number.isInteger(n) || n < 1 || n > 20) next.attendees = "Enter a number from 1 to 20";
    setErrors(next);
    if (Object.keys(next).length) return;

    setState("sending");
    setServerError(null);
    try {
      const res = await callForm("submitRsvp", {
        eventId,
        name: v.name.trim(),
        cooperative: v.cooperative.trim(),
        email: v.email.trim(),
        phone: v.phone.trim(),
        attendees: n,
        website: v.website ?? "",
        startedAt: started.current,
      });
      if (!res.ok) throw new Error(res.reason);
      setEmail(v.email.trim());
      setState("done");
      toast.success("Interest registered.");
    } catch (err) {
      setState("idle");
      setServerError(formError(err instanceof Error ? err.message : undefined));
    }
  };

  if (state === "done") {
    return (
      <p role="status" className="rounded-card border border-cord bg-paper-raise p-6">
        <span className="t-card block">Interest registered.</span>
        <span className="mt-1 block text-ink-muted">A confirmation is on its way to {email}.</span>
      </p>
    );
  }

  const field = (name: string, text: string, type = "text", extra: Record<string, string | number> = {}) => (
    <div>
      <Label htmlFor={`rsvp-${name}`}>{text}</Label>
      <Input
        id={`rsvp-${name}`}
        name={name}
        type={type}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `rsvp-${name}-error` : undefined}
        {...extra}
      />
      <p id={`rsvp-${name}-error`} aria-live="polite" className="mt-1 min-h-5 text-[0.88rem] text-danger">{errors[name]}</p>
    </div>
  );

  return (
    <form onSubmit={onSubmit} onFocus={() => (started.current ||= Date.now())} noValidate className="grid gap-x-4 sm:grid-cols-2">
      {field("name", "Full name", "text", { autoComplete: "name" })}
      {field("cooperative", "Cooperative society")}
      {field("email", "Email", "email", { autoComplete: "email" })}
      {field("phone", "Phone", "tel", { autoComplete: "tel" })}
      {field("attendees", "Number attending", "number", { min: 1, max: 20, defaultValue: 1 })}
      <Input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="sm:col-span-2">
        <p aria-live="assertive" className="mb-2 text-danger">{serverError}</p>
        <Button type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Registering interest" : "Register interest"}
        </Button>
      </div>
    </form>
  );
}
