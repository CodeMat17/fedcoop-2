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
        {d.photoUrl ? (
          <Image src={d.photoUrl} alt={`Portrait of ${d.name}`} fill sizes={large ? "(min-width: 1024px) 33vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"} className="object-cover" />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 grid place-items-center text-[3rem] font-black text-cord/40">{initials}</span>
        )}
      </div>
      <div className="p-5 text-left">
        <p className={large ? "t-card" : "text-base leading-snug font-bold"}>{d.name}</p>
        <p className="mt-1 font-bold text-cord">{d.office}</p>      
      </div>
    </>
  );

  if (!d.bio) return <article className={card}>{body}</article>;

  return (
    <Dialog.Root>
      <Dialog.Trigger className={cn(card, "block w-full hover:border-cord")} aria-label={`${d.name}, ${d.office}. Read biography`}>
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
