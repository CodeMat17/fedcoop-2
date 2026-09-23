"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import Image from "next/image";
import type { Director } from "@/lib/types";
import { card, cn } from "@/lib/ui";

export function DirectorCard({ d, large = false }: { d: Director; large?: boolean }) {
  const initials = d.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("");
  const body = (
    <>
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-card bg-cord-soft">
        <svg aria-hidden="true" viewBox="0 0 200 250" className="absolute inset-0 h-full w-full text-cord" preserveAspectRatio="xMidYMid slice">
          <g fill="none" stroke="currentColor" strokeOpacity={0.1} strokeWidth={0.6}>
            {Array.from({ length: 18 }, (_, i) => (
              <ellipse key={i} cx={100} cy={125} rx={90} ry={30} transform={`rotate(${i * 10} 100 125)`} />
            ))}
          </g>
        </svg>
        {d.photoUrl ? (
          <Image src={d.photoUrl} alt={`Portrait of ${d.name}`} fill sizes={large ? "(min-width: 1024px) 33vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"} className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
            <span className="grid size-24 place-items-center rounded-full bg-paper-raise text-[1.75rem] font-black tracking-[-0.03em] text-cord ring-1 ring-cord-line">{initials}</span>
          </span>
        )}
      </div>
      <div className="border-t border-cord-line p-5 text-left">
        <p className={large ? "t-card" : "text-base leading-snug font-bold"}>{d.name}</p>
        <p className="mt-1.5 text-[0.72rem] font-bold tracking-[0.12em] text-brass uppercase">{d.office}</p>
      </div>
    </>
  );

  if (!d.bio) return <article className={cn(card, "group overflow-hidden")}>{body}</article>;

  return (
    <Dialog.Root>
      <Dialog.Trigger className={cn(card, "group block w-full overflow-hidden hover:-translate-y-0.5 hover:border-cord/50 hover:shadow-[0_24px_48px_-28px_color-mix(in_oklab,var(--cord)_45%,transparent)]")} aria-label={`${d.name}, ${d.office}. Read biography`}>
        {body}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[70] bg-ink/40" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-[71] max-h-[85svh] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-card border border-cord-line bg-paper-raise p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="t-section">{d.name}</Dialog.Title>
              <p className="mt-1 font-bold text-cord">{d.office}</p>
            </div>
            <Dialog.Close className="grid size-11 shrink-0 place-items-center rounded-chip hover:bg-cord-soft" aria-label="Close">
              <X className="size-5" strokeWidth={1.5} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-4 whitespace-pre-line text-ink-muted">{d.bio}</Dialog.Description>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
