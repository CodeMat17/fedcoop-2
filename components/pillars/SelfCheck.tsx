"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { btn, cn } from "@/lib/ui";

const QUESTIONS = [
  "Has your society held an Annual General Meeting in the last 12 months?",
  "Have audited accounts for the last financial year been filed?",
  "Is your loan policy written down and approved by members?",
  "Are management committee elections held on the schedule set in your bye-laws?",
  "Does the committee keep signed minutes of every meeting?",
  "Can members get a statement of their savings and loans on request?",
  "Are cash and bank records reconciled at least once a month?",
  "Do at least two officers sign every payment?",
  "Has your registration with the cooperative regulator been kept current?",
  "Have committee members received governance or bookkeeping training in the last two years?",
];

type Answer = "yes" | "no" | undefined;

/** Entirely client-side: no submission, no storage, no personal data (§10). */
export function SelfCheck() {
  const [answers, setAnswers] = useState<Answer[]>(Array(QUESTIONS.length).fill(undefined));
  const answered = answers.filter(Boolean).length;
  const score = answers.filter((a) => a === "yes").length;
  const done = answered === QUESTIONS.length;

  const band =
    score >= 9
      ? { title: "Strong governance", body: "Your society meets most of the basics. A formal peer review can confirm this independently and give members and partners evidence of it." }
      : score >= 6
        ? { title: "Good foundations, some gaps", body: "Several areas need attention. A peer review will identify practical fixes and help your committee prioritise them." }
        : { title: "Governance needs attention", body: "Your society would benefit from a formal peer review and committee training. FEDCOOP can help you plan both." };

  return (
    <div className="rounded-card border border-cord-line bg-paper-raise p-5 md:p-8">
      <ol className="space-y-5">
        {QUESTIONS.map((q, i) => (
          <li key={q}>
            <fieldset className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <legend className="float-left max-w-[44ch] font-semibold md:float-none">
                <span className="tabular mr-2 text-cord">{String(i + 1).padStart(2, "0")}</span>
                {q}
              </legend>
              <RadioGroup
                name={`q${i}`}
                value={answers[i] ?? null}
                onValueChange={(v) => setAnswers((a) => a.map((x, j) => (j === i ? (v as Answer) : x)))}
                className="clear-both flex w-auto gap-2 md:clear-none"
              >
                {(["yes", "no"] as const).map((v) => (
                  <RadioGroupItem
                    key={v}
                    value={v}
                    className={cn(
                      "inline-flex aspect-auto size-auto min-h-11 min-w-20 cursor-pointer items-center justify-center rounded-chip border px-4 font-bold after:hidden [&_[data-slot=radio-group-indicator]]:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass focus-visible:ring-0",
                      answers[i] === v ? "border-cord bg-cord text-paper" : "border-cord-line bg-transparent hover:border-cord",
                    )}
                  >
                    {v === "yes" ? "Yes" : "No"}
                  </RadioGroupItem>
                ))}
              </RadioGroup>
            </fieldset>
          </li>
        ))}
      </ol>

      <div aria-live="polite" className="mt-8 border-t border-cord-line pt-6">
        {done ? (
          <>
            <p className="t-meta tabular text-ink-muted">{score} of {QUESTIONS.length} answered yes</p>
            <p className="t-section mt-1">{band.title}</p>
            <p className="mt-2 max-w-[52ch] text-ink-muted">{band.body}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact?category=peer-review" className={btn.primary}>Request a peer review</Link>
              <Button type="button" variant="secondary" onClick={() => setAnswers(Array(QUESTIONS.length).fill(undefined))}>
                Start again
              </Button>
            </div>
          </>
        ) : (
          <p className="text-ink-muted">
            <span className="tabular">{answered} of {QUESTIONS.length}</span> answered. Your result appears when every question has an answer. Nothing is sent or stored.
          </p>
        )}
      </div>
    </div>
  );
}
