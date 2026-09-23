"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { ExternalLink, Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageField } from "@/components/admin/Media";
import { ConfirmButton, Empty, Field, Loading, PageHead, Panel, Toggle, list, opt, optNum, slugInput, useRun } from "@/components/admin/ui";
import { useUnsavedWarning } from "@/components/admin/useUnsavedWarning";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { slugify } from "@/convex/slug";
import { STATES } from "@/lib/states";
import { btn, input } from "@/lib/ui";

type MdaCategory = Doc<"cooperatives">["mdaCategory"];
const MDA_CATEGORIES: MdaCategory[] = ["ministry", "department", "agency", "parastatal"];

export default function EditCooperative() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const coop = useQuery(api.admin.cooperatives.get, isNew ? "skip" : { id });

  if (!isNew && coop === undefined) return <Loading />;
  if (!isNew && coop === null) return <Empty title="Cooperative not found">It may have been deleted.</Empty>;
  return <CoopForm key={coop?._id ?? "new"} initial={coop ?? undefined} />;
}

function CoopForm({ initial }: { initial?: Doc<"cooperatives"> }) {
  const router = useRouter();
  const save = useMutation(api.admin.cooperatives.save);
  const remove = useMutation(api.admin.cooperatives.remove);
  const { run, pending } = useRun();
  const [dirty, setDirty] = useState(false);
  useUnsavedWarning(dirty);

  const [f, setF] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    acronym: initial?.acronym ?? "",
    aliases: (initial?.aliases ?? []).join(", "),
    mda: initial?.mda ?? "",
    mdaCategory: initial?.mdaCategory ?? ("ministry" as MdaCategory),
    stateCode: initial?.stateCode ?? "NG-FC",
    city: initial?.city ?? "",
    address: initial?.address ?? "",
    about: initial?.about ?? "",
    logoUrl: initial?.logoUrl,
    foundedYear: String(initial?.foundedYear ?? ""),
    affiliatedYear: String(initial?.affiliatedYear ?? ""),
    membershipBand: initial?.membershipBand ?? "",
    membershipSize: String(initial?.membershipSize ?? ""),
    membershipStatus: (initial?.membershipStatus ?? "") as "" | "active" | "provisional",
    services: (initial?.services ?? []).join(", "),
    committee: initial?.committee ?? [],
    contactEmail: initial?.contactEmail ?? "",
    contactPhone: initial?.contactPhone ?? "",
    website: initial?.website ?? "",
    isVerified: initial?.isVerified ?? false,
    isRegistered: initial?.isRegistered ?? false,
    isPublished: initial?.isPublished ?? false,
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const set = (patch: Partial<typeof f>) => {
    setF((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  async function submit() {
    const committee = f.committee.filter((m) => m.name.trim() && m.office.trim());
    const id = await run(
      () =>
        save({
          id: initial?._id,
          name: f.name,
          slug: f.slug,
          acronym: opt(f.acronym),
          aliases: list(f.aliases),
          mda: f.mda.trim(),
          mdaCategory: f.mdaCategory,
          stateCode: f.stateCode,
          city: opt(f.city),
          address: opt(f.address),
          about: opt(f.about),
          logoUrl: f.logoUrl,
          foundedYear: optNum(f.foundedYear),
          affiliatedYear: optNum(f.affiliatedYear),
          membershipBand: opt(f.membershipBand),
          membershipSize: optNum(f.membershipSize),
          membershipStatus: f.membershipStatus === "" ? undefined : f.membershipStatus,
          services: list(f.services),
          committee: committee.length ? committee : undefined,
          contactEmail: opt(f.contactEmail),
          contactPhone: opt(f.contactPhone),
          website: opt(f.website),
          isVerified: f.isVerified,
          isRegistered: f.isRegistered,
          isPublished: f.isPublished,
        }),
      "Cooperative saved",
    );
    if (!id) return;
    setDirty(false);
    if (!initial) router.replace(`/admin/cooperatives/${id}`);
  }

  const text = (key: keyof typeof f, label: string, props: { type?: string; hint?: string; required?: boolean } = {}) => (
    <Field label={label} htmlFor={`c-${key}`} hint={props.hint} required={props.required}>
      <Input
        id={`c-${key}`}
        type={props.type}
        value={f[key] as string}
        onChange={(e) => set({ [key]: e.target.value } as Partial<typeof f>)}
        required={props.required}
      />
    </Field>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <PageHead
        title={initial ? initial.name : "Add cooperative"}
        back={{ href: "/admin/cooperatives", label: "All cooperatives" }}
        actions={
          <>
            {initial?.isPublished && (
              <a href={`/cooperatives/${initial.slug}`} target="_blank" rel="noreferrer" className={btn.ghost}>
                View live <ExternalLink aria-hidden="true" />
              </a>
            )}
            {initial && (
              <ConfirmButton
                size="default"
                onConfirm={async () => {
                  const done = await run(() => remove({ id: initial._id }), "Cooperative deleted");
                  if (done !== undefined) router.replace("/admin/cooperatives");
                }}
              />
            )}
            <Button type="submit" disabled={pending}>
              Save
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Panel title="Society">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name" htmlFor="c-name" required className="md:col-span-2">
                <Input
                  id="c-name"
                  value={f.name}
                  onChange={(e) => set({ name: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })}
                  required
                />
              </Field>
              {text("acronym", "Acronym")}
              <Field label="URL slug" htmlFor="c-slug" hint={`/cooperatives/${f.slug || "…"}`}>
                <Input
                  id="c-slug"
                  value={f.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set({ slug: slugInput(e.target.value) });
                  }}
                />
              </Field>
              {text("aliases", "Other names", { hint: "Comma-separated; helps search." })}
              {text("mda", "MDA", { required: true, hint: "Ministry, department or agency the society serves." })}
              <Field label="MDA type" htmlFor="c-cat">
                <select id="c-cat" className={input} value={f.mdaCategory} onChange={(e) => set({ mdaCategory: e.target.value as MdaCategory })}>
                  {MDA_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c[0].toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="State" htmlFor="c-state" required>
                <select id="c-state" className={input} value={f.stateCode} onChange={(e) => set({ stateCode: e.target.value })}>
                  {STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Field>
              {text("city", "City")}
              {text("address", "Address")}
              <Field label="About" htmlFor="c-about" className="md:col-span-2">
                <Textarea id="c-about" rows={4} value={f.about} onChange={(e) => set({ about: e.target.value })} />
              </Field>
              {text("services", "Services", { hint: "Comma-separated, e.g. Savings, Loans, Housing." })}
            </div>
          </Panel>

          <Panel title="Membership">
            <div className="grid gap-4 md:grid-cols-2">
              {text("foundedYear", "Year founded", { type: "number" })}
              {text("affiliatedYear", "Year affiliated", { type: "number" })}
              {text("membershipSize", "Members", { type: "number" })}
              {text("membershipBand", "Membership band", { hint: "Shown instead of an exact count, e.g. 500–1,000." })}
              <Field label="Membership status" htmlFor="c-mstatus">
                <select
                  id="c-mstatus"
                  className={input}
                  value={f.membershipStatus}
                  onChange={(e) => set({ membershipStatus: e.target.value as typeof f.membershipStatus })}
                >
                  <option value="">Not set</option>
                  <option value="active">Active</option>
                  <option value="provisional">Provisional</option>
                </select>
              </Field>
            </div>
          </Panel>

          <Panel
            title="Management committee"
            actions={
              <Button type="button" size="sm" variant="secondary" onClick={() => set({ committee: [...f.committee, { name: "", office: "" }] })}>
                <Plus aria-hidden="true" /> Add member
              </Button>
            }
          >
            {f.committee.length === 0 ? (
              <p className="text-ink-muted">No committee members listed.</p>
            ) : (
              <ul className="space-y-2">
                {f.committee.map((m, i) => (
                  <li key={i} className="flex gap-2">
                    <Input
                      aria-label="Name"
                      placeholder="Name"
                      value={m.name}
                      onChange={(e) => set({ committee: f.committee.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })}
                    />
                    <Input
                      aria-label="Office"
                      placeholder="Office, e.g. President"
                      value={m.office}
                      onChange={(e) => set({ committee: f.committee.map((x, j) => (j === i ? { ...x, office: e.target.value } : x)) })}
                    />
                    <Button type="button" variant="ghost" size="icon" aria-label="Remove member" onClick={() => set({ committee: f.committee.filter((_, j) => j !== i) })}>
                      <X />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Contact">
            <div className="grid gap-4 md:grid-cols-2">
              {text("contactEmail", "Email", { type: "email" })}
              {text("contactPhone", "Phone", { type: "tel" })}
              {text("website", "Website", { type: "url" })}
            </div>
          </Panel>
        </div>

        <aside className="space-y-5">
          <Panel title="Status">
            <div className="space-y-4">
              <Toggle checked={f.isPublished} onChange={(isPublished) => set({ isPublished })} label="Published" description="Listed in the public directory." />
              <Toggle checked={f.isRegistered} onChange={(isRegistered) => set({ isRegistered })} label="Registered with FEDCOOP" />
              <Toggle checked={f.isVerified} onChange={(isVerified) => set({ isVerified })} label="Details verified" />
            </div>
          </Panel>
          <Panel title="Logo">
            <ImageField folder="cooperatives" value={f.logoUrl} onChange={(logoUrl) => set({ logoUrl })} aspect="aspect-square" />
          </Panel>
        </aside>
      </div>
    </form>
  );
}
