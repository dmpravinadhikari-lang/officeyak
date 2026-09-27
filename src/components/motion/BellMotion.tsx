import type { CSSProperties } from "react";

/**
 * The bell, moving.
 *
 * The motion sheet states the rule in one line: ease-out cubic, two hundred
 * to six hundred milliseconds, one motif, and the motif is the bell. So this
 * is the only animated mark in the product. A generic spinner anywhere in
 * OfficeYak is a spinner that could belong to any piece of software, and the
 * moment somebody waits is the moment they are looking hardest at the screen.
 *
 * Three states, which is all the sheet defines and all the product needs:
 *
 *   swing   waiting for something. Continuous, plus or minus twelve degrees
 *           on a sine, so it reads as a bell rather than as a metronome.
 *   ring    the Yak has something for you. Arcs expand once and fade.
 *   still   the mark, unmoved.
 *
 * Done in CSS keyframes rather than a JavaScript loop for two reasons: it
 * animates on the compositor rather than the main thread, so it keeps moving
 * while React is busy, which is exactly when a loading state is on screen;
 * and it works before hydration, so the first paint is already correct.
 *
 * Everything here stops under prefers-reduced-motion. A person who has asked
 * their device for less movement is not asking for less of it from us.
 */

export type BellState = "swing" | "ring" | "still";

export function BellMotion({
  size = 72,
  state = "still",
  tone = "brand",
  className = "",
  style,
}: {
  size?: number;
  state?: BellState;
  /** brand keeps the three colours; mono draws the whole mark in currentColor. */
  tone?: "brand" | "mono" | "white";
  className?: string;
  style?: CSSProperties;
}) {
  const mono = tone !== "brand";
  const ink = tone === "white" ? "#fff" : tone === "mono" ? "currentColor" : "#15133A";
  const c = (colour: string) => (mono ? "currentColor" : colour);

  return (
    <svg
      viewBox="0 0 64 64" width={size} height={size} aria-hidden
      className={`oy-bell oy-bell-${state} ${className}`}
      style={{ display: "block", overflow: "visible", ...style }}
    >
      {/* The swinging half pivots at the strap, the way a bell hangs. */}
      <g className="oy-bell-body">
        <rect x="28" y="4" width="8" height="10" rx="3" fill={ink} />
        <path d="M18 18 Q32 10 46 18 L52 44 L12 44 Z" fill={c("#FF7A1A")} />
        <path d="M18 18 Q32 10 46 18 L48 30 L16 30 Z" fill={c("#F0407A")} opacity={mono ? 0.6 : 1} />
        <rect x="8" y="42" width="48" height="8" rx="4" fill={c("#FFC526")} />
        <circle cx="32" cy="55" r="5" fill={ink} />
      </g>

      {/* The two arcs, which only exist while something is ringing. */}
      {state === "ring" && (
        <g className="oy-bell-arcs" stroke={c("#FFC526")} strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M6 42 Q0 32 6 22" />
          <path d="M58 42 Q64 32 58 22" />
        </g>
      )}
    </svg>
  );
}

/**
 * The loading screen, and the only one in the product.
 *
 * Navy ground, the bell swinging, and a bar that runs the brand order:
 * pink, orange, yellow. It is the same motif the app opens with and the same
 * one that rings at you later, so waiting for OfficeYak looks like OfficeYak
 * rather than like a browser.
 */
export function Splash({ caption = "Loading your office" }: { caption?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 rounded-2xl bg-ink px-6 py-16">
      <div className="oy-bob">
        <BellMotion size={120} state="swing" tone="white" />
      </div>
      <p className="text-[18px] font-medium text-white">{caption}</p>
      <div className="h-1 w-[280px] overflow-hidden rounded-full bg-white/15">
        <div className="oy-sweep h-full rounded-full bg-[linear-gradient(90deg,#F0407A,#FF7A1A,#FFC526)]" />
      </div>
    </div>
  );
}
