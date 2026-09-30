import Link from "next/link";
import { Mukta } from "next/font/google";

/**
 * The Dashain banner for the homepage.
 *
 * It switches itself on and off. Dashain moves every year with the lunar
 * calendar, so the window is a dated constant rather than a guess: 2026 runs
 * Ghatasthapana on 11 October to Kojagrat Purnima on 25 October. Before it
 * starts the banner counts down; during the festival it greets; after it, it
 * renders nothing at all and the homepage is exactly as it was.
 *
 * Everything is drawn and animated in CSS — no images, no JavaScript, no
 * client component. A seasonal banner that costs a hydration boundary and
 * three network round trips is a bad trade for two weeks of the year.
 *
 * Drop it directly above the hero in `src/app/page.tsx`:
 *
 *     <SiteHeader signedIn={Boolean(user)} />
 *     <DashainBanner />
 *     <section className="relative overflow-hidden bg-canvas">
 */

/** Mukta is drawn for Devanagari and carries a Latin of the same colour, so
 *  "शुभ दशैं" and "Happy Dashain" sit together without a fallback seam. */
const devanagari = Mukta({
  subsets: ["devanagari", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-dashain",
  display: "swap",
});

/**
 * Dashain 2026. Ghatasthapana 11 October, Vijaya Dashami (tika) 21 October,
 * Kojagrat Purnima 25 October. Update these three lines each year; nothing
 * else in the file knows the dates.
 */
export const DASHAIN = {
  start: "2026-10-11",
  tika: "2026-10-21",
  end: "2026-10-25",
  /** How many days before Ghatasthapana the countdown appears. */
  leadDays: 14,
} as const;

const DAY = 86_400_000;
/** Nepal is UTC+5:45, so "today" here is Kathmandu's today, not the server's. */
const NPT_OFFSET = 5.75 * 3_600_000;

const nptMidnight = (iso: string) => Date.parse(`${iso}T00:00:00Z`) - NPT_OFFSET;

export type DashainPhase =
  | { show: false }
  | { show: true; mode: "countdown"; days: number }
  | { show: true; mode: "festival"; toTika: number };

/** Which face the banner should wear, if any. Exported so it can be tested. */
export function dashainPhase(now: Date = new Date()): DashainPhase {
  const t = now.getTime();
  const start = nptMidnight(DASHAIN.start);
  const tika = nptMidnight(DASHAIN.tika);
  const end = nptMidnight(DASHAIN.end) + DAY; // inclusive of the last day

  if (t >= end) return { show: false };
  if (t >= start) return { show: true, mode: "festival", toTika: Math.ceil((tika - t) / DAY) };

  const days = Math.ceil((start - t) / DAY);
  return days <= DASHAIN.leadDays ? { show: true, mode: "countdown", days } : { show: false };
}

export function DashainBanner({
  now,
  /** An offer or an office-hours note. Left empty because neither is mine to
   *  invent — pass one and it appears as a third line. */
  note,
  href = "/signup",
  cta = "Start free this Dashain",
}: {
  now?: Date;
  note?: string;
  href?: string;
  cta?: string;
}) {
  const phase = dashainPhase(now);
  if (!phase.show) return null;

  const headline = phase.mode === "countdown" ? "दशैं आउँदै छ" : "शुभ दशैं";
  const sub =
    phase.mode === "countdown"
      ? `Dashain begins in ${phase.days} day${phase.days === 1 ? "" : "s"}.`
      : phase.toTika > 0
        ? `Tika in ${phase.toTika} day${phase.toTika === 1 ? "" : "s"}.`
        : "Happy Dashain from all of us at OfficeYak.";

  return (
    <section className={`${devanagari.variable} dx`} aria-label="Dashain greeting">
      <style>{CSS}</style>

      {/* ---------------------------------------------------------- the sky */}
      <div className="dx-sky" aria-hidden />

      {/* Kites. Dashain is when the monsoon clears, which is the whole reason
          the sky fills with them — so they get the top of the frame. */}
      <div className="dx-kites" aria-hidden>
        {KITES.map((k) => (
          <svg key={k.id} className={`dx-kite dx-kite-${k.id}`} viewBox="0 0 60 116" width="60" height="116">
            <path d="M30 2 L56 34 L30 74 L4 34 Z" fill={k.body} />
            <path d="M30 2 L30 74 M4 34 L56 34" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
            <path d="M30 2 L56 34 L30 74 L4 34 Z" fill="none" stroke="rgba(21,19,58,0.18)" strokeWidth="1.5" />
            {/* the tail, which is what makes a diamond read as a kite */}
            <path d="M30 74 q10 12 -2 20 q-11 9 1 20" fill="none" stroke={k.tail} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="26" cy="86" r="3" fill={k.tail} />
            <circle cx="32" cy="100" r="3" fill={k.tail} />
          </svg>
        ))}
      </div>

      {/* ------------------------------------------------- the linge ping */}
      <div className="dx-ping" aria-hidden>
        <svg viewBox="0 0 300 380" width="300" height="380">
          {/* Two legs splayed wide and crossed at the top. No rungs between
              them: a horizontal line from pole to pole turns the whole thing
              into a stepladder, which is exactly what it looked like first
              time. The ticks below sit ON each pole instead. */}
          <g stroke="#C08F42" strokeWidth="9" strokeLinecap="round" fill="none">
            <path d="M18 380 L134 28" />
            <path d="M92 380 L146 28" />
            <path d="M282 380 L166 28" />
            <path d="M208 380 L154 28" />
          </g>
          {/* bamboo nodes — short ticks across one pole each, never spanning */}
          <g stroke="#916826" strokeWidth="2.5" strokeLinecap="round" opacity="0.7">
            <path d="M46 290 L60 290 M70 218 L83 218 M92 148 L104 148" />
            <path d="M254 290 L240 290 M230 218 L217 218 M208 148 L196 148" />
          </g>
          <path d="M128 30 H172" stroke="#916826" strokeWidth="10" strokeLinecap="round" />

          {/* Mostly rope, pale enough to read against the sky, with the seat
              held clear of the ridge below. */}
          <g className="dx-swing" style={{ transformOrigin: "150px 32px" }}>
            <path d="M136 34 L128 236 M164 34 L172 236" stroke="#F3E2C2" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="112" y="234" width="76" height="13" rx="5" fill="#C2803A" />
            <rect x="112" y="234" width="76" height="5" rx="2.5" fill="#E6AC66" />
          </g>
      </svg>
      </div>

      {/* ------------------------------------------------- marigold garland */}
      <svg className="dx-garland" viewBox="0 0 1200 70" preserveAspectRatio="none" aria-hidden>
        <path d="M0 6 Q300 62 600 30 T1200 8" fill="none" stroke="#2F7D32" strokeWidth="5" />
      </svg>
      <div className="dx-marigolds" aria-hidden>
        {MARIGOLDS.map((m, i) => (
          <span key={i} className="dx-mari" style={{ left: `${m.x}%`, top: `${m.y}px`, ["--d" as string]: `${m.d}s` }}>
            <svg viewBox="0 0 24 24" width="22" height="22">
              <circle cx="12" cy="12" r="10" fill={i % 3 === 0 ? "#FF7A1A" : i % 3 === 1 ? "#FFC526" : "#FF9A3C"} />
              <circle cx="12" cy="12" r="5.5" fill="rgba(255,255,255,0.28)" />
            </svg>
          </span>
        ))}
      </div>

      {/* ------------------------------------------------------------ words */}
      <div className="dx-inner">
        <div className="dx-words">
          <p className="dx-eyebrow">
            <span className="dx-jamara" aria-hidden>
              <svg viewBox="0 0 22 22" width="18" height="18">
                <path d="M11 21 V8" stroke="#2F7D32" strokeWidth="2" strokeLinecap="round" />
                <path d="M11 12 C6 11 4 7 4 3 C9 4 11 7 11 12 Z" fill="#69B23C" />
                <path d="M11 12 C16 11 18 7 18 3 C13 4 11 7 11 12 Z" fill="#8CC63F" />
              </svg>
            </span>
            Dashain {new Date(DASHAIN.start).getFullYear()}
          </p>

          <h2 className="dx-head">{headline}</h2>
          <p className="dx-sub">{sub}</p>
          {note ? <p className="dx-note">{note}</p> : null}

          <Link href={href} className="dx-cta">
            {cta}
            <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden>
              <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>

      {/* The brand ridge, so this is OfficeYak's Dashain and not a stock one. */}
      <svg className="dx-ridge" viewBox="0 0 1200 150" preserveAspectRatio="none" aria-hidden>
        <path d="M0 150 L190 52 L380 150 Z" fill="#F0407A" />
        <path d="M840 150 L1000 66 L1160 150 Z" fill="#FFC526" />
        <path d="M1050 150 L1200 78 L1350 150 Z" fill="#F0407A" />
        <path d="M320 150 L560 14 L800 150 Z" fill="#FF7A1A" />
      </svg>
    </section>
  );
}

/** Four kites, drifting on their own clocks so they never line up. */
const KITES = [
  { id: 1, body: "#F0407A", tail: "#FFC526" },
  { id: 2, body: "#FFC526", tail: "#F0407A" },
  { id: 3, body: "#FF7A1A", tail: "#FFF3E9" },
  { id: 4, body: "#E4443C", tail: "#FFC526" },
] as const;

/** Positions along the swag, so the flowers hang on the string. */
const MARIGOLDS = Array.from({ length: 26 }, (_, i) => {
  const x = (i / 25) * 100;
  // The curve the garland is drawn on, sampled so the flowers sit on it.
  const y = 6 + Math.sin((i / 25) * Math.PI) * 30 + (i % 2) * 4;
  return { x, y, d: 3 + ((i * 7) % 5) * 0.4 };
});

const CSS = `
.dx {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: 470px;
  display: flex;
  align-items: center;
  font-family: var(--font-dashain), var(--font-sans), system-ui, sans-serif;
}
@media (max-width: 760px) { .dx { min-height: 520px; } }

/* The autumn sky Dashain actually happens under: the monsoon has just
   cleared, which is why the kites are up there in the first place. */
.dx-sky {
  position: absolute;
  inset: 0;
  z-index: -2;
  background:
    radial-gradient(120% 80% at 78% 12%, rgba(255, 197, 38, 0.30), rgba(255, 197, 38, 0) 60%),
    radial-gradient(90% 70% at 12% 0%, rgba(240, 64, 122, 0.20), rgba(240, 64, 122, 0) 62%),
    linear-gradient(175deg, #2B3F86 0%, #5A5FA8 34%, #B2739B 64%, #F4A65C 88%, #FFC98A 100%);
}

.dx-inner {
  position: relative;
  z-index: 3;
  margin: 0 auto;
  width: 100%;
  max-width: 1200px;
  padding: 58px 24px 96px;
}
.dx-words { max-width: 33rem; }

.dx-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px;
  padding: 6px 14px 6px 10px;
  border-radius: 999px;
  background: rgba(21, 19, 58, 0.34);
  border: 1px solid rgba(255, 255, 255, 0.24);
  color: #FFF3E9;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.dx-jamara { display: inline-flex; }

.dx-head {
  margin: 0;
  font-size: clamp(46px, 7vw, 82px);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.01em;
  color: #FFFFFF;
  text-shadow: 0 6px 30px rgba(21, 19, 58, 0.45);
}
.dx-sub {
  margin: 14px 0 0;
  font-size: clamp(17px, 2.2vw, 21px);
  line-height: 1.5;
  color: rgba(255, 243, 233, 0.94);
  max-width: 30rem;
}
.dx-note {
  margin: 10px 0 0;
  font-size: 15.5px;
  line-height: 1.5;
  color: rgba(255, 243, 233, 0.8);
  max-width: 30rem;
}

.dx-cta {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-top: 26px;
  padding: 14px 26px;
  border-radius: 999px;
  background: #FF7A1A;
  color: #15133A;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 10px 26px -10px rgba(21, 19, 58, 0.7);
  transition: transform 160ms ease, background-color 160ms ease;
}
.dx-cta:hover { background: #FF933F; transform: translateY(-1px); }
.dx-cta:focus-visible { outline: 3px solid #FFF3E9; outline-offset: 3px; }

/* ------------------------------------------------------------------ kites */
.dx-kites { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
.dx-kite { position: absolute; transform-origin: 30px 2px; }
.dx-kite-1 { left: 46%; top: 4%;  animation: dx-drift 13s ease-in-out infinite; }
.dx-kite-2 { left: 64%; top: 20%; transform: scale(0.72); animation: dx-drift 17s ease-in-out infinite reverse; }
.dx-kite-3 { left: 68%; top: 3%;  transform: scale(0.88); animation: dx-drift 15s ease-in-out infinite 1.5s; }
.dx-kite-4 { left: 56%; top: 40%; transform: scale(0.52); opacity: 0.85; animation: dx-drift 19s ease-in-out infinite 3s; }
@media (max-width: 760px) {
  .dx-kite-1 { left: 8%;  top: 2%; }
  .dx-kite-2 { left: 40%; top: 14%; }
  .dx-kite-3 { left: 70%; top: 1%; }
  .dx-kite-4 { display: none; }
}
@keyframes dx-drift {
  0%, 100% { translate: 0 0;      rotate: -7deg; }
  25%      { translate: 26px 14px; rotate: 5deg; }
  50%      { translate: 8px 30px;  rotate: -3deg; }
  75%      { translate: -20px 12px; rotate: 8deg; }
}

/* ------------------------------------------------------------ linge ping */
.dx-ping {
  position: absolute;
  right: 4%;
  bottom: 0;
  z-index: 2;
  pointer-events: none;
}
@media (max-width: 980px) { .dx-ping { right: -4%; transform: scale(0.8); transform-origin: bottom right; } }
@media (max-width: 760px) { .dx-ping { opacity: 0.42; transform: scale(0.62); } }
.dx-swing { animation: dx-rock 4.4s ease-in-out infinite; }
@keyframes dx-rock {
  0%, 100% { rotate: 11deg; }
  50%      { rotate: -11deg; }
}

/* ------------------------------------------------------------- garland */
.dx-garland { position: absolute; top: 0; left: 0; width: 100%; height: 70px; z-index: 2; }
.dx-marigolds { position: absolute; top: 0; left: 0; width: 100%; height: 70px; z-index: 2; pointer-events: none; }
.dx-mari { position: absolute; translate: -50% 0; animation: dx-sway var(--d, 4s) ease-in-out infinite; transform-origin: 50% 0; }
@keyframes dx-sway {
  0%, 100% { rotate: -6deg; }
  50%      { rotate: 6deg; }
}

/* --------------------------------------------------------------- ridge */
.dx-ridge { position: absolute; bottom: 0; left: 0; width: 100%; height: 130px; z-index: 1; }

@media (prefers-reduced-motion: reduce) {
  .dx-kite, .dx-swing, .dx-mari { animation: none !important; }
}
`;
