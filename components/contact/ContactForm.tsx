"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, type FieldError } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { callForm, formError } from "@/lib/convex-client";
import { ENQUIRY_CATEGORIES, type EnquiryCategory } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const TURNSTILE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const categories = ENQUIRY_CATEGORIES.map((c) => c.value) as [EnquiryCategory, ...EnquiryCategory[]];

const schema = z
  .object({
    category: z.enum(categories, { errorMap: () => ({ message: "Choose what your enquiry is about" }) }),
    fullName: z.string().trim().min(2, "Enter your full name"),
    email: z.string().trim().email("Enter an email address we can reply to, for example name@agency.gov.ng"),
    phone: z
      .string()
      .trim()
      .refine((v) => v === "" || /^[+\d][\d\s()-]{6,}$/.test(v), "Enter a phone number we can reach you on"),
    subject: z.string().trim().max(140, "Keep the subject under 140 characters"),
    message: z.string().trim().min(10, "Tell us a little more, at least 10 characters"),
    cooperativeName: z.string().trim().optional(),
    mda: z.string().trim().optional(),
    contactPerson: z.string().trim().optional(),
    consent: z.literal(true, { errorMap: () => ({ message: "Tick the box to let FEDCOOP use these details to reply" }) }),
  })
  .superRefine((v, ctx) => {
    // Membership-only fields are validated only while they are visible.
    if (v.category !== "membership") return;
    if (!v.cooperativeName) ctx.addIssue({ code: "custom", path: ["cooperativeName"], message: "Enter the registered name of your cooperative society" });
    if (!v.mda) ctx.addIssue({ code: "custom", path: ["mda"], message: "Enter the ministry, department or agency your society serves" });
    if (!v.contactPerson) ctx.addIssue({ code: "custom", path: ["contactPerson"], message: "Enter the name of the person FEDCOOP should speak to" });
    if (!v.phone) ctx.addIssue({ code: "custom", path: ["phone"], message: "Enter a phone number we can reach you on" });
  });

type Values = z.infer<typeof schema>;

function Field({
  id,
  text,
  error,
  optional,
  children,
}: {
  id: string;
  text: string;
  error?: FieldError;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id}>
        {text} {optional && <span className="font-normal text-ink-muted">(optional)</span>}
      </Label>
      {children}
      <p id={`${id}-error`} aria-live="polite" className="mt-1 min-h-5 text-[0.88rem] text-danger">
        {error?.message}
      </p>
    </div>
  );
}

export function ContactForm() {
  const params = useSearchParams();
  const reduced = useReducedMotion();
  const initial = (ENQUIRY_CATEGORIES.find((c) => c.value === params.get("category"))?.value ?? "general") as EnquiryCategory;
  const started = useRef(Date.now());
  const formRef = useRef<HTMLFormElement>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    unregister,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { category: initial, fullName: "", email: "", phone: "", subject: "", message: "" },
    shouldUnregister: false,
  });

  const category = watch("category");
  const isMembership = category === "membership";

  useEffect(() => {
    const c = params.get("category");
    const match = ENQUIRY_CATEGORIES.find((x) => x.value === c);
    if (match) {
      setValue("category", match.value);
      document.getElementById("enquiry")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    }
  }, [params, setValue, reduced]);

  useEffect(() => {
    if (!isMembership) unregister(["cooperativeName", "mda", "contactPerson"], { keepValue: true });
  }, [isMembership, unregister]);

  const aria = (name: keyof Values) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  const onSubmit = async (v: Values) => {
    setServerError(null);
    const fd = new FormData(formRef.current!);
    try {
      const res = await callForm("submitEnquiry", {
        category: v.category,
        fullName: v.fullName,
        email: v.email,
        phone: v.phone || undefined,
        subject: v.subject || undefined,
        message: v.message,
        ...(v.category === "membership"
          ? { cooperativeName: v.cooperativeName, mda: v.mda, contactPerson: v.contactPerson }
          : {}),
        website: (fd.get("website") as string) ?? "",
        startedAt: started.current,
        turnstileToken: (fd.get("cf-turnstile-response") as string) || undefined,
      });
      if (!res.ok) {
        setServerError(formError(res.reason));
        return;
      }
      setSentTo(v.email);
      toast.success("Enquiry sent.");
    } catch {
      setServerError(formError());
    }
  };

  if (sentTo) {
    return (
      <div role="status" className="rounded-card border border-cord bg-paper-raise p-8">
        <CheckCircle2 className="size-8 text-cord" strokeWidth={1.5} aria-hidden="true" />
        <p className="t-section mt-4">Enquiry sent.</p>
        <p className="mt-2 text-ink-muted">FEDCOOP will respond to {sentTo} within two working days.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-2">
      {TURNSTILE_KEY && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />}

      <Field id="category" text="What is your enquiry about?" error={errors.category}>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Select
              items={ENQUIRY_CATEGORIES}
              value={field.value}
              onValueChange={(v) => v && field.onChange(v)}
            >
              <SelectTrigger id="category" ref={field.ref} onBlur={field.onBlur} {...aria("category")} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENQUIRY_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <AnimatePresence initial={false}>
        {isMembership && (
          <m.fieldset
            key="membership"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mb-4 rounded-card border border-cord-line bg-cord-soft/60 p-5">
              <legend className="t-card mb-4 float-left w-full">About your cooperative society</legend>
              <div className="clear-both space-y-2">
                <Field id="cooperativeName" text="Cooperative society name" error={errors.cooperativeName}>
                  <Input id="cooperativeName" {...register("cooperativeName")} {...aria("cooperativeName")} autoComplete="organization" />
                </Field>
                <Field id="mda" text="MDA" error={errors.mda}>
                  <Input id="mda" {...register("mda")} {...aria("mda")} placeholder="e.g. Federal Ministry of Finance" />
                </Field>
                <Field id="contactPerson" text="Contact person" error={errors.contactPerson}>
                  <Input id="contactPerson" {...register("contactPerson")} {...aria("contactPerson")} />
                </Field>
              </div>
            </div>
          </m.fieldset>
        )}
      </AnimatePresence>

      <div className="grid gap-x-4 sm:grid-cols-2">
        <Field id="fullName" text="Full name" error={errors.fullName}>
          <Input id="fullName" {...register("fullName")} {...aria("fullName")} autoComplete="name" />
        </Field>
        <Field id="email" text={isMembership ? "Email address" : "Email"} error={errors.email}>
          <Input id="email" type="email" {...register("email")} {...aria("email")} autoComplete="email" />
        </Field>
        <Field id="phone" text={isMembership ? "Phone number" : "Phone"} error={errors.phone} optional={!isMembership}>
          <Input id="phone" type="tel" {...register("phone")} {...aria("phone")} autoComplete="tel" />
        </Field>
        <Field id="subject" text="Subject" error={errors.subject} optional>
          <Input id="subject" {...register("subject")} {...aria("subject")} />
        </Field>
      </div>

      <Field id="message" text="Message" error={errors.message}>
        <Textarea id="message" rows={6} {...register("message")} {...aria("message")} />
      </Field>

      {/* Honeypot: hidden from people, tempting to bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <Label className="mb-0 flex items-start gap-3 font-normal">
          <Controller
            control={control}
            name="consent"
            render={({ field }) => (
              <Checkbox
                ref={field.ref}
                name={field.name}
                checked={field.value === true}
                onCheckedChange={(checked) => field.onChange(checked ? true : undefined)}
                onBlur={field.onBlur}
                {...aria("consent")}
                className="mt-0.5"
              />
            )}
          />
          <span className="text-[0.95rem]">
            FEDCOOP may use these details to reply to this enquiry, as described in the{" "}
            <a href="/privacy" className="font-semibold text-cord underline underline-offset-4">privacy notice</a>.
          </span>
        </Label>
        <p id="consent-error" aria-live="polite" className="mt-1 min-h-5 text-[0.88rem] text-danger">
          {errors.consent?.message}
        </p>
      </div>

      {TURNSTILE_KEY && <div className="cf-turnstile" data-sitekey={TURNSTILE_KEY} data-theme="auto" />}

      <p aria-live="assertive" className="text-danger">{serverError}</p>

      <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? "Sending enquiry" : "Send enquiry"}
      </Button>
    </form>
  );
}
