"use client";

import { useActionState } from "react";
import { previewImport, commitImport, type PlanState } from "./actions";
import { Card, Chip, inputClass } from "@/components/ui";
import { Icon } from "@/components/Icon";

/**
 * Upload, look, then commit.
 *
 * The preview is the whole point. An office bringing four hundred families
 * across from a spreadsheet is making a decision it cannot easily undo, and
 * the difference between a product they trust and one they do not is whether
 * it told them what would happen before it happened.
 */
export function ImportForm() {
  const [state, preview, previewing] = useActionState<PlanState, FormData>(previewImport, {});
  const [committed, commit, committing] = useActionState<PlanState, FormData>(commitImport, {});

  if (committed.done !== undefined) {
    return (
      <Card className="border-l-4 border-l-teal-500 p-5">
        <h3 className="h-tight text-[16px]">
          {committed.done} {committed.done === 1 ? "record" : "records"} brought in
        </h3>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">
          They are on the student leads board, marked as imported so you can always tell them from
          the walk-ins. Open one and it behaves like any other enquiry.
        </p>
        <a href="/app/leads" className="oy-press mt-3 inline-flex min-h-[40px] items-center gap-2 rounded-[10px] bg-ink px-4 text-[13.5px] font-semibold text-white hover:bg-ink-2">
          Open the board <Icon name="arrow" size={15} />
        </a>
      </Card>
    );
  }

  const plan = state.plan;

  return (
    <div className="flex flex-col gap-4">
      <form action={preview}>
        <Card className="p-5">
          <h3 className="h-tight text-[16px]">Upload the spreadsheet</h3>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">
            Save it as CSV first: in Excel or Google Sheets, File, then Download or Save As, then
            CSV. The first row should be your column headings. We work out what the columns mean, so
            they do not have to be named anything in particular.
          </p>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="imp_file" className="block text-[12px] font-medium text-muted">CSV file</label>
              <input
                id="imp_file" type="file" name="file" accept=".csv,text/csv" required
                className="mt-1 block text-[13px] file:mr-3 file:min-h-[40px] file:rounded-[10px] file:border file:border-line-2 file:bg-panel file:px-4 file:text-[13.5px] file:font-semibold file:text-ink"
              />
            </div>
            <input type="hidden" name="kind" value="leads" />
            <button
              type="submit" disabled={previewing}
              className="oy-press inline-flex min-h-[44px] items-center gap-2 rounded-[10px] border border-line-2 px-5 text-[14px] font-semibold text-ink hover:border-brand-400 hover:text-brand-600 disabled:opacity-60"
            >
              {previewing ? "Reading…" : "Check the file"}
            </button>
          </div>

          {state.error && (
            <p className="mt-3 rounded-xl border border-danger-600/25 bg-danger-100 px-4 py-2.5 text-[13.5px] text-danger-600">
              {state.error}
            </p>
          )}
        </Card>
      </form>

      {plan && (
        <Card className="p-5">
          <h3 className="h-tight text-[16px]">What will happen</h3>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              ["Will be added", plan.counts.new, "teal"],
              ["Already here", plan.counts.duplicate, "grey"],
              ["Cannot be read", plan.counts.skipped, plan.counts.skipped ? "gold" : "grey"],
            ].map(([label, n, tone]) => (
              <div key={String(label)} className="rounded-xl bg-wash px-4 py-3">
                <div className="mono text-[22px] font-medium leading-none text-ink">{String(n)}</div>
                <div className="mt-1.5 text-[12.5px] text-muted">{label}</div>
                {String(tone) === "gold" && <Chip tone="gold">look below</Chip>}
              </div>
            ))}
          </div>

          <div className="mt-4 text-[13px]">
            <span className="font-semibold text-ink">Columns understood: </span>
            <span className="text-ink-2">{Object.values(plan.mapped).join(", ") || "none"}</span>
            {plan.unmapped.length > 0 && (
              <>
                <br />
                <span className="font-semibold text-ink">Ignored: </span>
                <span className="text-ink-2">{plan.unmapped.join(", ")}</span>
                <span className="text-muted"> (kept out rather than guessed at)</span>
              </>
            )}
          </div>

          {plan.counts.skipped > 0 && (
            <details className="mt-4 rounded-xl border border-line">
              <summary className="cursor-pointer px-4 py-2.5 text-[13.5px] font-semibold text-ink">
                The {plan.counts.skipped} rows that cannot be read
              </summary>
              <ul className="divide-y divide-line border-t border-line">
                {plan.rows.filter((r) => r.verdict === "skipped").slice(0, 40).map((r) => (
                  <li key={r.line} className="flex flex-wrap gap-2 px-4 py-2 text-[13px]">
                    <span className="mono text-muted">line {r.line}</span>
                    <span className="flex-1 text-ink-2">{r.values.full_name || "(no name)"}</span>
                    <span className="text-danger-600">{r.reason}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <details className="mt-3 rounded-xl border border-line">
            <summary className="cursor-pointer px-4 py-2.5 text-[13.5px] font-semibold text-ink">
              The first few that will be added
            </summary>
            <ul className="divide-y divide-line border-t border-line">
              {plan.rows.filter((r) => r.verdict === "new").slice(0, 12).map((r) => (
                <li key={r.line} className="flex flex-wrap gap-3 px-4 py-2 text-[13px]">
                  <span className="font-medium text-ink">{r.values.full_name}</span>
                  <span className="text-muted">{r.values.phone}</span>
                  <span className="text-muted">{r.values.destination}</span>
                </li>
              ))}
            </ul>
          </details>

          <form action={commit} className="mt-4 flex flex-wrap items-center gap-3">
            <input type="hidden" name="plan" value={JSON.stringify(plan)} />
            <button
              type="submit" disabled={committing || plan.counts.new === 0}
              className="oy-press inline-flex min-h-[44px] items-center gap-2 rounded-[10px] bg-brand-500 px-5 text-[14px] font-semibold text-ink hover:bg-brand-400 disabled:opacity-50"
            >
              <Icon name="check" size={16} />
              {committing ? "Bringing them in…" : `Add the ${plan.counts.new}`}
            </button>
            <span className="text-[12.5px] text-muted">
              Nothing has been written yet. Only the {plan.counts.new} marked new will be added.
            </span>
          </form>

          {committed.error && (
            <p className="mt-3 text-[13.5px] text-danger-600">{committed.error}</p>
          )}
        </Card>
      )}
    </div>
  );
}
