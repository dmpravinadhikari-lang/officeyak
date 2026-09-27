"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { BellMotion } from "@/components/motion/BellMotion";

/**
 * The three moving parts a person meets while actually working.
 *
 * The motion sheet defines six system states. The splash and the ring were
 * already built, but they live at the two moments somebody is least often
 * looking: the first paint of a page, and a notification. Everything in
 * between - pressing save, waiting for it, seeing that it worked, looking at a
 * list that has not arrived yet, looking at one that is empty - had no motion
 * at all, which is why the product read as still.
 *
 * These are the states that fire dozens of times a day:
 *
 *   SubmitButton   press, then the bell swinging in place of the label, then
 *                  one yellow flash that says Saved.
 *   Skeleton       a shimmering placeholder while a record loads.
 *
 * The sixth, the empty state, is Empty in ui.tsx, because it is a layout
 * everybody already imports from there and moving it would have touched
 * fourteen pages to no benefit.
 *
 * SubmitButton needs the client because it reads the form's pending state.
 * Skeleton does not, but it belongs beside it.
 */

const BUTTON = {
  primary: "bg-brand-500 text-ink hover:bg-brand-400 disabled:bg-brand-100 disabled:text-muted",
  secondary: "border border-line-2 bg-panel text-ink hover:border-brand-400 hover:text-brand-600",
  ghost: "text-brand-600 hover:bg-brand-50",
  danger: "border border-danger-600/30 bg-panel text-danger-600 hover:bg-danger-100",
} as const;

const SIZES = {
  sm: "min-h-[36px] px-4 text-[13px]",
  md: "min-h-[40px] px-5 text-[13.5px]",
  lg: "min-h-[48px] px-7 text-[15px]",
} as const;

/**
 * A submit button that says what it is doing.
 *
 * Server actions can take a second or more over a Kathmandu connection, and a
 * button that looks identical the whole time is a button people press again.
 * This one is disabled while the action runs, so the second press does nothing
 * even if it happens.
 *
 * The done state is Summit Yellow with Ink on it, which is the one pairing the
 * palette calls good at any size. It clears itself after 1.4 seconds: a
 * confirmation nobody has to dismiss.
 */
export function SubmitButton({
  children,
  pendingLabel = "Saving",
  doneLabel = "Saved",
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: {
  children: ReactNode;
  /** What the button says while the action runs. */
  pendingLabel?: string;
  /** What it says for a moment afterwards. Pass null to skip the flash. */
  doneLabel?: string | null;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children">) {
  const { pending } = useFormStatus();
  const [done, setDone] = useState(false);
  const was = useRef(false);

  useEffect(() => {
    if (pending) {
      was.current = true;
      return;
    }
    // The action has just finished. Only flash if this button was the one that
    // started it, so a page with four forms does not light all four up.
    if (!was.current || doneLabel === null) return;
    was.current = false;
    setDone(true);
    const t = setTimeout(() => setDone(false), 1400);
    return () => clearTimeout(t);
  }, [pending, doneLabel]);

  const skin = done ? "bg-accent-500 text-ink" : BUTTON[variant];

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      className={`oy-press inline-flex items-center justify-center gap-1.5 rounded-[10px] font-semibold transition-colors disabled:cursor-not-allowed ${skin} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {pending && <BellMotion size={16} state="swing" tone="mono" className="shrink-0" />}
      {done && <Tick />}
      {/* The label itself is the status. aria-live so it is announced even
          though the button loses focus while it is disabled. */}
      <span aria-live="polite">{pending ? `${pendingLabel}…` : done ? doneLabel : children}</span>
    </button>
  );
}

/** The tick that lands on the button when the action is done. */
function Tick() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden className="oy-flash shrink-0">
      <path
        d="M5 12.5 L10 17.5 L19 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * A placeholder for something that has not arrived yet.
 *
 * Use it in a Suspense fallback, never as a spinner for the whole page: the
 * sheet is explicit that one view gets one shimmer group, because two of them
 * read as a broken layout rather than a loading one.
 */
export function Skeleton({
  rows = 3,
  className = "",
}: { rows?: number; className?: string }) {
  const widths = ["78%", "54%", "66%", "45%", "71%"];
  return (
    <div className={`flex flex-col gap-3 ${className}`} aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="oy-shimmer h-3 rounded-full" style={{ width: widths[i % widths.length] }} />
      ))}
      <span className="sr-only" role="status">Loading</span>
    </div>
  );
}
