"use client";

import { Button } from "@/components/ui/button";
import { errorMessage } from "@/components/admin/ui";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="py-16">
      <h1 className="text-[1.5rem] font-black">This screen could not load</h1>
      <p className="mt-2 max-w-[60ch] text-ink-muted">{errorMessage(error)}</p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
