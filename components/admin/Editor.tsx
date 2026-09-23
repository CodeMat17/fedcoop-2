"use client";

import dynamic from "next/dynamic";

/* Tiptap is loaded only when an editor is on screen (§18.11). */
export const RichEditor = dynamic(() => import("./RichEditor"), {
  ssr: false,
  loading: () => <div className="min-h-[480px] animate-pulse rounded-card border border-cord-line bg-paper-raise" />,
});
