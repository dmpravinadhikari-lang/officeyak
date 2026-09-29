import { Card, Chip, type Tone } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { shortDate } from "@/lib/dates";
import { LEGAL } from "@/lib/legal";
import { billingFor, TERMS_DAYS } from "@/modules/billing/data";

const npr = (n: number) => `NPR ${n.toLocaleString("en-IN")}`;

/**
 * What this consultancy pays, and what they have paid.
 *
 * A customer being billed is entitled to see the bill without asking, and
 * before this there was nothing to see: the product knew which plan they were
 * on and nothing about money at all. The tone matters here. This is the one
 * screen where the software is asking its own customer for money, and it
 * should read like an account statement rather than a debt collector, right
 * up until something is actually late.
 */
export async function BillingCard({ tenantId, plan }: { tenantId: string; plan: string }) {
  const b = billingFor(tenantId, plan);

  const head: Record<string, { line: string; tone: Tone }> = {
    trial: {
      line: b.trialDaysLeft === null ? "You are on a free trial."
        : b.trialDaysLeft <= 0 ? "Your free trial has finished."
        : `Your free trial has ${b.trialDaysLeft} ${b.trialDaysLeft === 1 ? "day" : "days"} to run.`,
      tone: "gold",
    },
    active:    { line: "Your account is paid up.", tone: "teal" },
    overdue:   { line: `An invoice is ${b.lateDays} ${b.lateDays === 1 ? "day" : "days"} past its due date.`, tone: "danger" },
    lapsed:    { line: "Your account is unpaid.", tone: "danger" },
    cancelled: { line: "Your subscription has ended.", tone: "grey" },
  };
  const h = head[b.status];

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="h-tight text-[17px]">Billing</h2>
        <Chip tone={h.tone}>{h.line}</Chip>
      </div>

      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-[12.5px] text-muted">What you pay</dt>
          <dd className="num mt-0.5 text-[18px] font-semibold text-ink">{npr(b.nextAmountNpr)}</dd>
          <dd className="text-[12.5px] text-muted">{b.sub.cycle === "yearly" ? "a year" : "a month"}</dd>
        </div>
        <div>
          <dt className="text-[12.5px] text-muted">{b.status === "trial" ? "First bill due" : "Next bill"}</dt>
          <dd className="mt-0.5 text-[15px] text-ink">
            {b.sub.renews_on ? shortDate(b.sub.renews_on)
              : b.sub.trial_ends_on ? shortDate(b.sub.trial_ends_on)
              : "Not scheduled"}
          </dd>
        </div>
        <div>
          <dt className="text-[12.5px] text-muted">Outstanding</dt>
          <dd className={`num mt-0.5 text-[18px] font-semibold ${b.owedNpr > 0 ? "text-danger-600" : "text-teal-700"}`}>
            {b.owedNpr > 0 ? npr(b.owedNpr) : "Nothing"}
          </dd>
        </div>
      </dl>

      {b.invoices.length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <h3 className="text-[13px] font-semibold text-ink">Your invoices</h3>
          <ul className="mt-2 divide-y divide-line">
            {b.invoices.slice(0, 12).map((i) => (
              <li key={i.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-[13.5px]">
                <span className="font-mono text-[12.5px] text-muted">{i.number}</span>
                <span className="min-w-0 flex-1 text-ink-2">
                  {shortDate(i.period_from)} to {shortDate(i.period_to)}
                </span>
                <span className="num font-semibold text-ink">{npr(i.amount_npr)}</span>
                {i.paid_on
                  ? <Chip tone="teal">Paid {shortDate(i.paid_on)}</Chip>
                  : i.due_on < new Date().toISOString().slice(0, 10)
                    ? <Chip tone="danger">Overdue</Chip>
                    : <Chip tone="grey">Due {shortDate(i.due_on)}</Chip>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 flex flex-wrap items-start gap-2 border-t border-line pt-4 text-[13px] leading-relaxed text-muted">
        <Icon name="alert" size={15} className="mt-0.5 shrink-0 text-brand-600" />
        <span>
          Invoices come from {LEGAL.entity}, {LEGAL.place}, PAN {LEGAL.pan}, and are payable within{" "}
          {TERMS_DAYS} days by bank transfer. Bank details are on the invoice itself. Nothing is
          charged automatically and no card is held.
        </span>
      </p>
    </Card>
  );
}
