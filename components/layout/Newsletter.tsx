"use client";

import { useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { callForm, formError } from "@/lib/convex-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Newsletter() {
  const started = useRef(0);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter an email address, for example name@agency.gov.ng");
      return;
    }
    setError(null);
    setState("sending");
    const honeypot = (new FormData(e.currentTarget).get("website") as string) ?? "";
    try {
      const res = await callForm("subscribe", { email, website: honeypot, startedAt: started.current });
      if (!res.ok) throw new Error(res.reason);
      setState("done");
      toast.success("Subscribed to FEDCOOP updates.");
    } catch (err) {
      setState("idle");
      setError(formError(err instanceof Error ? err.message : undefined));
    }
  };

  if (state === "done") {
    return <p className="text-ink-muted">Subscribed. FEDCOOP updates will go to {email}.</p>;
  }

  return (
    <form onSubmit={onSubmit} noValidate onFocus={() => (started.current ||= Date.now())}>
      <p className="mb-3 text-ink-muted">News, events and training dates, about once a month.</p>
      <Label htmlFor="newsletter-email" className="sr-only">
        Email address
      </Label>
      <div className="flex flex-col gap-2 sm:flex-row md:flex-col 2xl:flex-row">
        <Input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@agency.gov.ng"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "newsletter-error" : undefined}
        />
        <Input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <Button type="submit" className="shrink-0" disabled={state === "sending"}>
          {state === "sending" ? "Subscribing" : "Subscribe"}
        </Button>
      </div>
      <p id="newsletter-error" aria-live="polite" className="mt-2 text-[0.9rem] text-danger">
        {error}
      </p>
    </form>
  );
}
