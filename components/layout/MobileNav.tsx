"use client";

import dynamic from "next/dynamic";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

const MobileMenu = dynamic(() => import("./MobileMenu"), { ssr: false });

/** Menu button; the drawer (base-ui dialog + accordion) loads on first open. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [wanted, setWanted] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className="grid size-11 place-items-center rounded-chip text-ink hover:bg-cord-soft xl:hidden"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setWanted(true);
          setOpen(true);
        }}
      >
        <Menu className="size-6" strokeWidth={1.5} />
      </button>
      {wanted && <MobileMenu open={open} setOpen={setOpen} />}
    </>
  );
}
