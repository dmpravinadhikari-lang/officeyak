import { Card, Chip, inputClass } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { shortDate } from "@/lib/dates";
import { CHARGE_KINDS, PAYMENT_METHODS, type Ledger } from "@/modules/fees/data";
import { chargeStudent, payStudent, toggleWaive, undoPayment } from "@/modules/fees/actions";
import { SubmitButton } from "@/components/ui-motion";

/**
 * The fee ledger on a student's own file.
 *
 * Two audiences. A counsellor needs to know whether the family still owes
 * something before starting the next piece of work, and that is the balance
 * alone. Taking money and changing what is owed is a different job, so the
 * detail and the forms only render for somebody with money:view.
 *
 * Our fees and pass-through charges are totalled separately on purpose. A
 * family looking at one number cannot tell what the office charged them from
 * what it paid on their behalf, and that confusion is what turns into an
 * accusation months later.
 */
export function FeesCard({
  studentId, ledger, canSeeDetail, canManage,
}: {
  studentId: string;
  ledger: Ledger;
  canSeeDetail: boolean;
  canManage: boolean;
}) {
  const npr = (n: number) => `NPR ${n.toLocaleString("en-IN")}`;
  const settled = ledger.balance <= 0;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="h-tight text-[16px]">Fees</h2>
        <span className={`mono text-[15px] font-semibold ${settled ? "text-teal-700" : "text-ink"}`}>
          {settled && ledger.billed > 0 ? "Settled" : npr(ledger.balance)}
          {!settled && <span className="ml-1 text-[12px] font-normal text-muted">outstanding</span>}
        </span>
      </div>

      {!canSeeDetail ? (
        <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
          {ledger.billed === 0
            ? "Nothing has been charged to this student yet."
            : "The balance is shown so you know where the family stands. The ledger and taking payments belong to whoever handles money here."}
        </p>
      ) : (
        <>
          {ledger.billed > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2 text-[12.5px]">
              {[
                ["Our fees", ledger.ours],
                ["Paid on their behalf", ledger.passedThrough],
                ["Received", ledger.paid],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl bg-wash px-3 py-2">
                  <div className="mono text-[14px] font-semibold text-ink">{npr(Number(value))}</div>
                  <div className="text-muted">{label}</div>
                </div>
              ))}
            </div>
          )}

          {ledger.charges.length > 0 && (
            <ul className="mt-4 divide-y divide-line">
              {ledger.charges.map((c) => {
                const kind = CHARGE_KINDS.find((k) => k.id === c.kind);
                return (
                  <li key={c.id} className="flex flex-wrap items-center gap-2 py-2.5">
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[13.5px] ${c.waived ? "text-muted line-through" : "text-ink"}`}>
                        {c.label}
                      </span>
                      {c.note && <span className="block text-[12px] text-muted">{c.note}</span>}
                    </span>
                    {c.kind !== "ours" && <Chip tone="grey">{kind?.label}</Chip>}
                    {c.waived === 1 && <Chip tone="teal">Waived</Chip>}
                    <span className={`mono shrink-0 text-[13.5px] ${c.waived ? "text-muted" : "text-ink"}`}>
                      {npr(c.amount_npr)}
                    </span>
                    {canManage && (
                      <form action={toggleWaive}>
                        <input type="hidden" name="student_id" value={studentId} />
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="waived" value={c.waived ? "0" : "1"} />
                        <button type="submit" className="px-1.5 text-[11.5px] font-medium text-muted hover:text-brand-600">
                          {c.waived ? "Restore" : "Waive"}
                        </button>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {ledger.payments.length > 0 && (
            <div className="mt-4 border-t border-line pt-3">
              <div className="text-[11px] font-medium uppercase tracking-[0.5px] text-muted">Payments received</div>
              <ul className="mt-1.5 divide-y divide-line">
                {ledger.payments.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center gap-2 py-2 text-[13px]">
                    <span className="min-w-0 flex-1 text-ink-2">
                      {shortDate(p.paid_on)} · {PAYMENT_METHODS.find((m) => m.id === p.method)?.label ?? p.method}
                      {p.reference && <span className="text-muted"> · {p.reference}</span>}
                    </span>
                    <span className="mono shrink-0 font-medium text-teal-700">{npr(p.amount_npr)}</span>
                    {canManage && (
                      <form action={undoPayment}>
                        <input type="hidden" name="student_id" value={studentId} />
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="px-1.5 text-[11.5px] font-medium text-muted hover:text-danger-600">
                          Remove
                        </button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {canManage && (
            <div className="mt-4 grid gap-3 border-t border-line pt-4 lg:grid-cols-2">
              <form action={chargeStudent} className="flex flex-col gap-2">
                <div className="text-[12px] font-semibold text-ink">Charge something</div>
                <input type="hidden" name="student_id" value={studentId} />
                <input name="label" required className={inputClass} placeholder="What for, e.g. Documentation" />
                <div className="flex gap-2">
                  <input name="amount_npr" inputMode="numeric" required className={inputClass} placeholder="NPR" />
                  <select name="kind" defaultValue="ours" className={inputClass} aria-label="Whose charge is this">
                    {CHARGE_KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
                  </select>
                </div>
                <SubmitButton variant="secondary" pendingLabel="Adding" doneLabel="Added">
                  <Icon name="plus" size={15} /> Add charge
                </SubmitButton>
              </form>

              <form action={payStudent} className="flex flex-col gap-2">
                <div className="text-[12px] font-semibold text-ink">Record a payment</div>
                <input type="hidden" name="student_id" value={studentId} />
                <div className="flex gap-2">
                  <input name="amount_npr" inputMode="numeric" required className={inputClass} placeholder="NPR" />
                  <select name="method" defaultValue="cash" className={inputClass} aria-label="How it was paid">
                    {PAYMENT_METHODS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <input name="paid_on" type="date" className={inputClass} aria-label="Date paid" />
                  <input name="reference" className={inputClass} placeholder="Receipt or transaction no." />
                </div>
                <SubmitButton pendingLabel="Recording" doneLabel="Recorded">
                  <Icon name="check" size={15} /> Record payment
                </SubmitButton>
              </form>
            </div>
          )}

          {ledger.charges.length === 0 && (
            <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
              Nothing charged yet. Record what the family was quoted at the first meeting, and keep
              a government fee on its own line rather than folded into yours.
            </p>
          )}
        </>
      )}
    </Card>
  );
}
