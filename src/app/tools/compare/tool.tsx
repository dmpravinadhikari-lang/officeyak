"use client";

import { useState } from "react";
import { COUNTRIES, COUNTRY_CODES, type CountryCode } from "@/lib/countries";
import { COST, FX_NPR, LEVEL_LABEL, type Level } from "@/modules/cost/data";
import { AFTER_STUDY } from "@/modules/tools/compare";
import { npr } from "@/lib/terms";
import { Card, LinkButton, inputClass } from "@/components/ui";
import { Icon } from "@/components/Icon";

/**
 * Two destinations, actually compared.
 *
 * The first version of this page was two independent lists sitting next to
 * each other, and that is not a comparison. Every one of the ten labels was
 * printed twice, so twenty labels carried ten facts; to answer "which costs
 * more" a reader had to find "Tuition a year" on the left, hold a number in
 * their head, find the same words on the right, and do the arithmetic the
 * page had all the information to do for them. On a phone the two lists
 * stacked, so the two numbers were never even on screen together.
 *
 * Three changes, and they are all the same idea: put the difference where the
 * eye already is.
 *
 * One row per fact, the label said once. The comparison then runs left to
 * right across a row, which is the direction people read, instead of down two
 * columns at once.
 *
 * The money rows say which is lower and by how much. That is the sentence
 * somebody came here to be able to say out loud, and it was the one thing the
 * page made them work out themselves.
 *
 * A verdict band at the top carrying the two facts that actually decide it:
 * what the whole course costs, and how long you may stay and work afterwards.
 * Everything else is detail underneath, still there, no longer competing.
 *
 * Deliberately not scored out of ten and no winner declared. A cheaper
 * country with no post-study work is the wrong answer for most families and
 * the right one for a few, and a page that picks for them would be guessing
 * at the half of the decision it cannot see.
 */

type Row = {
  label: string;
  /** Rendered per country. */
  value: (code: CountryCode) => string;
  /** Present for the rows where "lower is better" is a true statement. */
  amount?: (code: CountryCode) => number;
  hint?: string;
};

function figures(code: CountryCode, level: Level) {
  const k = COST[code];
  const rate = FX_NPR[k.currency];
  const tuition = k.tuition[level];
  const years = k.years[level];
  return {
    k,
    rate,
    years,
    tuition: tuition.typical,
    living: k.living.typical,
    total: (tuition.typical + k.living.typical) * years * rate,
    mustShow: (k.visaFunds.living + tuition.typical) * rate,
  };
}

/** A number and the local currency it is really quoted in. */
const money = (code: CountryCode, level: Level, pick: "tuition" | "living") => {
  const f = figures(code, level);
  const n = f[pick];
  return `${f.k.currency} ${n.toLocaleString("en-US")}\n${npr(n * f.rate)}`;
};

function buildRows(level: Level): Row[] {
  return [
    {
      label: "Whole course",
      hint: "Tuition and living together, for the usual course length.",
      value: (c) => npr(figures(c, level).total),
      amount: (c) => figures(c, level).total,
    },
    {
      label: "Must show in the bank",
      hint: "What the visa officer expects to see, untouched.",
      value: (c) => npr(figures(c, level).mustShow),
      amount: (c) => figures(c, level).mustShow,
    },
    {
      label: "Tuition a year",
      value: (c) => money(c, level, "tuition"),
      amount: (c) => figures(c, level).tuition * figures(c, level).rate,
    },
    {
      label: "Living a year",
      value: (c) => money(c, level, "living"),
      amount: (c) => figures(c, level).living * figures(c, level).rate,
    },
    {
      label: "Health cover",
      value: (c) => {
        const f = figures(c, level);
        return `${f.k.healthCoverName}\n${npr(f.k.healthCoverPerYear * f.rate)} a year`;
      },
      amount: (c) => {
        const f = figures(c, level);
        return f.k.healthCoverPerYear * f.rate;
      },
    },
    { label: "Course length", value: (c) => {
      const y = figures(c, level).years;
      return `${y} year${y === 1 ? "" : "s"}`;
    } },
    { label: "Visa", value: (c) => COUNTRIES[c].visa },
    { label: "Work while studying", value: (c) => AFTER_STUDY[c].workDuringStudy },
    { label: "Bringing family", value: (c) => AFTER_STUDY[c].dependants },
  ];
}

export function CompareTool() {
  const [left, setLeft] = useState<CountryCode>("AU");
  const [right, setRight] = useState<CountryCode>("UK");
  const [level, setLevel] = useState<Level>("masters");

  const rows = buildRows(level);
  const L = figures(left, level);
  const R = figures(right, level);
  const cheaper = L.total === R.total ? null : L.total < R.total ? left : right;
  const gap = Math.abs(L.total - R.total);

  const swap = () => { setLeft(right); setRight(left); };

  return (
    <div className="flex flex-col gap-5">
      {/*
        Two selects and a swap, on one line.

        This was three stacked rows of six country chips, eighteen controls and
        most of a screen before a single fact appeared. A select is the right
        control for one-of-six when the six are already familiar, and the swap
        button is there because turning the screen round to a family is the
        most common thing a counsellor does with this page.
      */}
      <Card className="p-4 sm:p-5">
        {/* A grid, not a wrapping flex row: flex-wrap left the two country
            selects sharing a phone's width, and "United Kingdom" was clipped
            to "United Kingdo". Four stacked full-width controls on a phone,
            one row from the small breakpoint up. */}
        <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr_1fr]">
          <Picker label="Compare" value={left} onChange={setLeft} />
          <button
            type="button" onClick={swap}
            aria-label="Swap the two countries"
            className="oy-press grid h-[42px] w-full shrink-0 place-items-center rounded-[10px] border border-line-2 bg-panel text-muted transition-colors hover:border-brand-400 hover:text-brand-600 sm:mb-0.5 sm:w-[42px]"
          >
            <Icon name="arrow" size={17} />
            <span className="sr-only">Swap</span>
          </button>
          <Picker label="With" value={right} onChange={setRight} />
          <div className="min-w-0">
            <label htmlFor="cmp-level" className="text-[12px] font-semibold text-muted">At what level</label>
            <select
              id="cmp-level" value={level} onChange={(e) => setLevel(e.target.value as Level)}
              className={`${inputClass} mt-1`}
            >
              {(Object.keys(LEVEL_LABEL) as Level[]).map((l) => (
                <option key={l} value={l}>{LEVEL_LABEL[l]}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* ------------------------------------------------------- the verdict */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-2 gap-px bg-line">
          {[left, right].map((code) => {
            const f = figures(code, level);
            const isCheaper = cheaper === code;
            return (
              <div key={code} className="bg-panel px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex items-center gap-2">
                  <span className="text-[22px] leading-none" aria-hidden>{COUNTRIES[code].flag}</span>
                  <h3 className="h-tight min-w-0 text-[17px] sm:text-[19px]">{COUNTRIES[code].name}</h3>
                </div>
                <div className="num mt-3 text-[clamp(22px,4vw,30px)] font-semibold leading-none text-ink">
                  {npr(f.total)}
                </div>
                <div className="mt-1.5 text-[12.5px] leading-snug text-muted">
                  the whole course
                  {isCheaper && gap > 0 && (
                    <span className="mt-1 block font-semibold text-teal-700">
                      {npr(gap)} less
                    </span>
                  )}
                </div>
                {/*
                  Post-study work sits in the headline beside the money on
                  purpose. For most Nepali families it is half the decision and
                  it was buried nine rows down, in the same grey as health cover.
                */}
                <div className="mt-4 border-t border-line pt-3">
                  <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
                    After you graduate
                  </div>
                  <p className="mt-1 text-[13px] leading-snug text-ink-2">{AFTER_STUDY[code].postStudyWork}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* --------------------------------------------------------- the detail */}
      <Card className="overflow-hidden">
        <table className="w-full table-fixed border-collapse">
          <caption className="sr-only">
            {COUNTRIES[left].name} compared with {COUNTRIES[right].name}
          </caption>
          <thead>
            <tr className="border-b border-line bg-wash/60">
              <th scope="col" className="w-[34%] px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-muted sm:w-[30%] sm:px-5">
                Side by side
              </th>
              {[left, right].map((c) => (
                <th key={c} scope="col" className="px-3 py-2.5 text-left text-[13px] font-semibold text-ink sm:px-5">
                  <span className="mr-1.5" aria-hidden>{COUNTRIES[c].flag}</span>
                  <span className="hidden sm:inline">{COUNTRIES[c].name}</span>
                  <span className="sm:hidden">{c}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => {
              const a = row.amount?.(left);
              const b = row.amount?.(right);
              const lower = a === undefined || b === undefined || a === b
                ? null : a < b ? left : right;
              return (
                <tr key={row.label} className="align-top">
                  <th scope="row" className="px-3 py-3 text-left sm:px-5">
                    <span className="block text-[13px] font-semibold text-ink">{row.label}</span>
                    {row.hint && (
                      <span className="mt-0.5 hidden text-[11.5px] leading-snug text-muted sm:block">{row.hint}</span>
                    )}
                  </th>
                  {[left, right].map((c) => (
                    <td key={c} className="px-3 py-3 text-[13px] leading-snug text-ink-2 sm:px-5">
                      {/*
                        The lower of two money figures is marked, and only
                        where "lower" is a true good. There is no tick on the
                        visa name or the work rules, because cheaper is a fact
                        and better is a judgement this page does not make.
                      */}
                      <span className={lower === c ? "font-semibold text-ink" : undefined}>
                        {row.value(c).split("\n").map((line, i) => (
                          <span key={i} className={i === 0 ? "block" : "block text-[12px] text-muted"}>{line}</span>
                        ))}
                      </span>
                      {lower === c && (
                        <span className="mt-1 inline-flex items-center gap-1 text-[11.5px] font-semibold text-teal-700">
                          <Icon name="check" size={12} /> lower
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* --------------------------------------------------------- watch outs */}
      <div className="grid gap-3 sm:grid-cols-2">
        {[left, right].map((c) => (
          <div key={c} className="rounded-2xl border border-gold-600/25 bg-gold-100/50 px-4 py-3.5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.11em] text-gold-600">
              Watch out in {COUNTRIES[c].name}
            </div>
            <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">{AFTER_STUDY[c].watchOut}</p>
          </div>
        ))}
      </div>

      <Card className="border-brand-200 bg-brand-50/60 p-5">
        <h3 className="h-tight text-[16px]">Cost is rarely the thing that decides it</h3>
        <p className="mt-1.5 max-w-2xl text-[14.5px] leading-relaxed text-ink-2">
          Work rights, whether a partner can come, and whether the course qualifies for the
          post-study visa matter more to most families than a few lakh of tuition. Check those
          before anyone falls in love with a city.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <LinkButton href="/tools/cost" size="md" variant="secondary">Cost it out properly</LinkButton>
          <LinkButton href="/tools/eligibility" size="md">Check if you qualify</LinkButton>
        </div>
      </Card>

      <p className="text-[12px] leading-relaxed text-muted">
        Visa and work rules change at short notice, and several of these have. Confirm anything you
        are about to act on with the destination&rsquo;s own immigration site.
      </p>
    </div>
  );
}

function Picker({
  label, value, onChange,
}: { label: string; value: CountryCode; onChange: (v: CountryCode) => void }) {
  return (
    <div className="min-w-0">
      <label htmlFor={`cmp-${label}`} className="text-[12px] font-semibold text-muted">{label}</label>
      <select
        id={`cmp-${label}`} value={value}
        onChange={(e) => onChange(e.target.value as CountryCode)}
        className={`${inputClass} mt-1`}
      >
        {COUNTRY_CODES.map((k) => (
          <option key={k} value={k}>{COUNTRIES[k].flag} {COUNTRIES[k].name}</option>
        ))}
      </select>
    </div>
  );
}
