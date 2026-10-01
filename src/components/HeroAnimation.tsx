"use client";

import { useEffect, useState } from "react";
import { BellMotion } from "@/components/motion/BellMotion";
import { Ridge } from "@/components/Logo";

/**
 * The hero, building itself.
 *
 * Ported from "Website Hero Animation" in the brand kit, which is a 1280x720
 * composition written for the motion tool's own runtime: window.OY, a
 * CompositionStage, a MOTION timeline. None of that exists here, so this is a
 * reimplementation of the motion rather than a copy of the file.
 *
 * Three things in the composition are deliberately not here.
 *
 * Its nav says "Book a demo" and its second button says "Watch 2-min tour".
 * There is no demo to book, that decision was made on purpose, and there is
 * no tour. Shipping either would be the website promising something the
 * business does not do.
 *
 * And it draws its own nav and its own headline, because it was authored as a
 * standalone 16:9 film. The page already has both, and better ones. So what
 * is kept is the half that the page cannot say in words: the product
 * assembling itself, and the Yak noticing something.
 */

const KPIS = [
  { label: "Active leads", value: "1,284", dot: "#F0407A" },
  { label: "Classes today", value: "18", dot: "#FF7A1A" },
  { label: "Visa deadlines", value: "7", dot: "#FFC526" },
] as const;

const ROWS = [
  { name: "Sujata Karki", course: "IELTS · Australia", state: "Docs pending", flag: true },
  { name: "Bikash Thapa", course: "PTE · Canada", state: "Offer received", flag: false },
  { name: "Anisha Rai", course: "TOPIK · Korea", state: "Visa lodged", flag: false },
  { name: "Roshan Gurung", course: "JLPT · Japan", state: "Counselling", flag: false },
] as const;

/* The line the Yak types. The composition had an em dash; the house style
   does not use them, and a comma carries the same pause. */
const SAYS = "Sujata Karki's Australia file is missing the GTE statement, due Friday.";

export function HeroAnimation({ className = "" }: { className?: string }) {
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    /*
     * Somebody who has asked their device for less movement is not asking for
     * less of the message. They get the finished sentence at once rather than
     * a slower version of the same effect.
     */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(SAYS);
      setDone(true);
      return;
    }

    /*
     * No "have I run before" ref here, deliberately.
     *
     * React invokes an effect, tears it down and invokes it again in
     * development. A ref guard survives that teardown, so the second
     * invocation returns early, having already had its timer cancelled by the
     * first cleanup, and nothing is ever typed. Cancelling cleanly and
     * starting again is both correct and simpler.
     */
    let i = 0;
    let typing = 0;
    const begin = window.setTimeout(() => {
      typing = window.setInterval(() => {
        i += 1;
        setTyped(SAYS.slice(0, i));
        if (i >= SAYS.length) {
          window.clearInterval(typing);
          setDone(true);
        }
      }, 24);
    }, 2600);

    return () => {
      window.clearTimeout(begin);
      window.clearInterval(typing);
    };
  }, []);

  return (
    <div
      className={`oy-hero relative aspect-[5/4] overflow-hidden rounded-2xl bg-ink sm:aspect-[16/11] ${className}`}
      /* One image to a screen reader, because that is what it is: a picture
         of the product, not a document to be walked through. */
      role="img"
      aria-label="The OfficeYak dashboard: active leads, classes today and visa deadlines, a short list of students by course and stage, and the Yak flagging a missing document."
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0">
        <Ridge height={110} opacity={0.5} />
      </div>

      {/* the dashboard */}
      <div
        aria-hidden
        className="oy-hero-panel absolute left-[6%] right-[6%] top-[5%] overflow-hidden rounded-[18px] bg-panel text-ink shadow-[0_40px_80px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-center gap-2 px-4 pb-2 pt-3 text-[11px] text-ink-2 sm:px-5 sm:text-[12.5px]">
          <span className="h-2 w-2 rounded-[3px] bg-brand-500" />
          Kathmandu branch · Today
          <span className="ml-auto font-semibold text-ink">Overview</span>
        </div>

        <div className="grid grid-cols-3 gap-2 px-4 sm:gap-3 sm:px-5">
          {KPIS.map((k, i) => (
            <div
              key={k.label}
              className="oy-hero-pop rounded-[12px] border border-line bg-wash px-2.5 py-1.5 sm:px-4 sm:py-2.5"
              style={{ animationDelay: `${0.75 + i * 0.12}s` }}
            >
              <div className="text-[9.5px] leading-tight text-ink-2 sm:text-[11.5px]">{k.label}</div>
              <div className="num mt-0.5 flex items-baseline gap-1.5 text-[17px] font-semibold sm:text-[26px]">
                {k.value}
                <span className="h-1.5 w-1.5 rounded-[2px] sm:h-2 sm:w-2" style={{ background: k.dot }} />
              </div>
            </div>
          ))}
        </div>

        {/* Above the list, not below it. Below, the Yak card covered it at
            every width, which is markup nobody ever sees. */}
        <div className="mx-4 mt-2 flex items-center gap-2 text-[9.5px] text-ink-2 sm:mx-5 sm:mt-3 sm:text-[11.5px]">
          <span className="shrink-0">Applications this month</span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-wash sm:h-2">
            <span className="oy-hero-bar block h-full rounded-full bg-[linear-gradient(90deg,#F0407A,#FF7A1A)]" />
          </span>
          <b className="num shrink-0 text-ink">72%</b>
        </div>

        <div className="mx-4 mb-4 mt-2 overflow-hidden rounded-[12px] border border-line sm:mx-5 sm:mb-5 sm:mt-3">
          {ROWS.map((r, i) => (
            <div
              key={r.name}
              className={`oy-hero-slide grid-cols-[1.3fr_1.1fr_1fr] gap-2 px-2.5 py-1.5 text-[9.5px] sm:px-3.5 sm:py-2.5 sm:text-[12.5px] ${i ? "border-t border-line" : ""} ${i === ROWS.length - 1 ? "hidden sm:grid" : "grid"}`}
              style={{ animationDelay: `${1.15 + i * 0.1}s` }}
            >
              <span className="truncate font-semibold">{r.name}</span>
              <span className="truncate text-ink-2">{r.course}</span>
              <span className={`truncate ${r.flag ? "font-semibold text-[#F0407A]" : "text-ink-2"}`}>{r.state}</span>
            </div>
          ))}
        </div>

      </div>

      {/* the Yak noticing */}
      <div
        aria-hidden
        className="oy-hero-says absolute bottom-[4%] left-[6%] right-[6%] flex items-start gap-3 rounded-[16px] border-[1.5px] border-accent-500 bg-ink px-3.5 py-3 text-white shadow-[0_30px_60px_rgba(0,0,0,0.45)] sm:px-4"
      >
        <BellMotion size={34} state={done ? "still" : "swing"} tone="dark" className="shrink-0" />
        <div className="min-w-0">
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-accent-500 sm:text-[11px]">
            Yak says
          </div>
          <div className="mt-0.5 min-h-[2.4em] text-[11px] leading-snug sm:text-[14.5px]">
            {typed}
            {!done && <span className="oy-hero-caret">|</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
