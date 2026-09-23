"use client";

import { useMutation, useQuery } from "convex/react";
import { ChevronDown, Copy, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmButton, Empty, Loading, PageHead, Status, useRun } from "@/components/admin/ui";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { fmtDate, fmtTime } from "@/lib/format";
import { ENQUIRY_CATEGORIES } from "@/lib/site";
import { card, cn, input } from "@/lib/ui";

type EnquiryStatus = Doc<"enquiries">["status"];
const STATUSES: { value: EnquiryStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "in-progress", label: "In progress" },
  { value: "closed", label: "Closed" },
];

const categoryLabel = (c: string) => ENQUIRY_CATEGORIES.find((x) => x.value === c)?.label ?? c;

export default function EnquiriesAdmin() {
  const [status, setStatus] = useState<EnquiryStatus | "">("new");
  const [category, setCategory] = useState("");
  const rows = useQuery(api.admin.inbox.enquiries, { status: status || undefined });
  const shown = rows?.filter((r) => !category || r.category === category);

  return (
    <>
      <PageHead title="Enquiries" description="Messages from the contact form. The sender also receives an automatic confirmation email." />
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="flex rounded-chip border border-cord-line bg-paper-raise p-0.5" role="group" aria-label="Status">
          {[{ value: "" as const, label: "All" }, ...STATUSES].map((s) => (
            <button
              key={s.value}
              type="button"
              aria-pressed={status === s.value}
              onClick={() => setStatus(s.value)}
              className={cn(
                "min-h-9 rounded-[3px] px-3 text-[0.88rem] font-semibold text-ink-muted",
                status === s.value && "bg-cord text-paper",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <select aria-label="Category" className={cn(input, "min-h-10 w-auto py-1.5")} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {ENQUIRY_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      {!shown ? (
        <Loading />
      ) : shown.length === 0 ? (
        <Empty title="Nothing here">No enquiries match these filters.</Empty>
      ) : (
        <ul className="space-y-2">
          {shown.map((e) => (
            <EnquiryItem key={e._id} enquiry={e} />
          ))}
        </ul>
      )}
    </>
  );
}

function EnquiryItem({ enquiry: e }: { enquiry: Doc<"enquiries"> }) {
  const update = useMutation(api.admin.inbox.updateEnquiry);
  const remove = useMutation(api.admin.inbox.removeEnquiry);
  const { run, pending } = useRun();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(e.note ?? "");

  function copyDetails() {
    const lines = [
      e.fullName,
      e.email,
      e.phone,
      e.cooperativeName && `Cooperative: ${e.cooperativeName}`,
      e.mda && `MDA: ${e.mda}`,
      e.contactPerson && `Contact person: ${e.contactPerson}`,
      `Category: ${categoryLabel(e.category)}`,
      e.subject && `Subject: ${e.subject}`,
      "",
      e.message,
    ].filter((l): l is string => typeof l === "string");
    void navigator.clipboard.writeText(lines.join("\n")).then(() => toast.success("Enquirer details copied"));
  }

  return (
    <li className={cn(card, e.status === "new" && "border-l-4 border-l-brass")}>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-4 p-4 text-left">
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">
            {e.fullName}
            {e.cooperativeName && <span className="font-normal text-ink-muted"> · {e.cooperativeName}</span>}
          </p>
          <p className="truncate text-[0.88rem] text-ink-muted">
            {categoryLabel(e.category)} · {e.subject || e.message.slice(0, 90)}
          </p>
        </div>
        <span className="hidden text-[0.85rem] whitespace-nowrap text-ink-muted sm:block">{fmtDate(e.createdAt)}</span>
        <Status on={e.status === "closed"} onLabel="Closed" offLabel={e.status === "new" ? "New" : "In progress"} />
        <ChevronDown className={cn("size-4 shrink-0 text-ink-muted transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open && (
        <div className="grid gap-6 border-t border-cord-line p-4 md:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <p className="text-[0.85rem] text-ink-muted">
              {fmtDate(e.createdAt)} at {fmtTime(e.createdAt)}
            </p>
            {e.subject && <p className="mt-2 font-bold">{e.subject}</p>}
            <p className="mt-2 whitespace-pre-wrap">{e.message}</p>
            <dl className="mt-4 grid gap-1 text-[0.9rem] sm:grid-cols-[auto_1fr] sm:gap-x-4">
              {e.mda && (
                <>
                  <dt className="text-ink-muted">MDA</dt>
                  <dd>{e.mda}</dd>
                </>
              )}
              {e.contactPerson && (
                <>
                  <dt className="text-ink-muted">Contact person</dt>
                  <dd>{e.contactPerson}</dd>
                </>
              )}
            </dl>
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <a href={`mailto:${e.email}?subject=${encodeURIComponent(`Re: ${e.subject ?? categoryLabel(e.category)}`)}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-chip border border-cord-line px-3 text-[0.88rem] font-semibold hover:border-cord">
                <Mail className="size-4" aria-hidden="true" /> {e.email}
              </a>
              {e.phone && (
                <a href={`tel:${e.phone}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-chip border border-cord-line px-3 text-[0.88rem] font-semibold hover:border-cord">
                  <Phone className="size-4" aria-hidden="true" /> {e.phone}
                </a>
              )}
              <Button size="sm" variant="secondary" onClick={copyDetails}>
                <Copy aria-hidden="true" /> Copy details
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Set status">
              {STATUSES.map((s) => (
                <Button
                  key={s.value}
                  size="sm"
                  variant="outline"
                  aria-pressed={e.status === s.value}
                  disabled={pending}
                  onClick={() => run(() => update({ id: e._id, status: s.value }), `Marked ${s.label.toLowerCase()}`)}
                >
                  {s.label}
                </Button>
              ))}
            </div>
            <div>
              <label htmlFor={`note-${e._id}`} className="mb-1 block text-[0.85rem] font-bold">
                Internal note
              </label>
              <Textarea id={`note-${e._id}`} rows={3} value={note} onChange={(ev) => setNote(ev.target.value)} placeholder="Only admins see this." />
              <div className="mt-2 flex justify-between">
                <Button size="sm" variant="secondary" disabled={pending || note === (e.note ?? "")} onClick={() => run(() => update({ id: e._id, note }), "Note saved")}>
                  Save note
                </Button>
                <ConfirmButton onConfirm={() => run(() => remove({ id: e._id }), "Enquiry deleted")} />
              </div>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
