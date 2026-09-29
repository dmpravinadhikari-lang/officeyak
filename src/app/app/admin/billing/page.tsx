import Link from "next/link";
import { requireCapability } from "@/lib/auth/guard";
import { Card, Chip, Empty, Field, PageHeader, Th, inputClass, type Tone } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { SubmitButton } from "@/components/ui-motion";
import { shortDate } from "@/lib/dates";
import { LEGAL } from "@/lib/legal";
import {
  accounts, revenueSummary, unpaidInvoices, TERMS_DAYS,
  type AccountRow,
} from "@/modules/billing/data";
import { issueInvoice, markInvoicePaid } from "@/modules/billing/actions";

export const metadata = { title: "Money in, OfficeYak" };

const STATUS: Record<string, { label: string; tone: Tone }> = {
  overdue:   { label: "Owes money",   tone: "danger" },
  lapsed:    { label: "Gave up on",   tone: "danger" },
  trial:     { label: "On trial",     tone: "gold" },
  active:    { label: "Paying",       tone: "teal" },
  cancelled: { label: "Left",         tone: "grey" },
};

const npr = (n: number) => `NPR ${n.toLocaleString("en-IN")}`;

/**
 * Who owes Straw Holdings money, and who is about to.
 *
 * This is the screen the business did not have. The admin panel could set a
 * consultancy's plan and switch them off, and between those two buttons there
 * was nothing: no start date, no renewal, no invoice, no record that anyone
 * had ever paid. The dashboard reported revenue by adding up the list price of
 * every account on the system, which meant it reported revenue that did not
 * exist.
 *
 * Sorted worst first, because it is opened to answer one question and a list
 * in alphabetical order makes you read all of it to find out.
 */
export default async function BillingPage() {
  await requireCapability("platform:tenants");
  const rows = accounts();
  const sum = revenueSummary();
  const unpaid = unpaidInvoices();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Money in"
        sub={sum.paying === 0
          ? `Nobody is paying yet. ${sum.trials} ${sum.trials === 1 ? "consultancy is" : "consultancies are"} on trial.`
          : `${npr(sum.monthly)} a month from ${sum.paying} ${sum.paying === 1 ? "consultancy" : "consultancies"}.`}
        actions={<Link href="/app/admin" className="oy-press inline-flex min-h-[44px] items-center gap-2 rounded-[10px] border border-line-2 px-5 text-sm font-semibold text-ink-2 hover:border-ink-2"><Icon name="settings" size={16} /> Admin</Link>}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Being paid a month" value={npr(sum.monthly)} sub={`${sum.paying} paying`} tone="teal" />
        <Tile label="Owed right now" value={npr(sum.owed)} sub={sum.owed > 0 ? "invoiced, not paid" : "nothing outstanding"} tone={sum.owed > 0 ? "danger" : "teal"} />
        <Tile label="Need chasing" value={String(sum.chasing)} sub="late or given up on" tone={sum.chasing > 0 ? "gold" : "teal"} />
        <Tile label="On trial" value={String(sum.trials)} sub="not yet asked to pay" tone="brand" />
      </div>

      {unpaid.length > 0 && (
        <Card className="overflow-hidden">
          <div className="border-b border-line bg-wash/60 px-5 py-3">
            <h2 className="h-tight text-[15px]">Waiting to be paid</h2>
            <p className="mt-0.5 text-[13px] text-muted">
              Oldest first. When the money lands in the {LEGAL.entity} account, record it here.
            </p>
          </div>
          <ul className="divide-y divide-line">
            {unpaid.map((i) => (
              <li key={i.id} className="flex flex-col gap-3 px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[14px] font-semibold text-ink">{i.tenant_name}</span>
                  <Chip tone="grey">{i.number}</Chip>
                  <span className="num text-[14px] font-semibold text-ink">{npr(i.amount_npr)}</span>
                  {i.lateDays > 0
                    ? <Chip tone="danger">{i.lateDays} {i.lateDays === 1 ? "day" : "days"} late</Chip>
                    : <Chip tone="grey">Due {shortDate(i.due_on)}</Chip>}
                  <span className="text-[12.5px] text-muted">
                    {shortDate(i.period_from)} to {shortDate(i.period_to)}
                  </span>
                </div>
                <form action={markInvoicePaid} className="grid gap-3 sm:grid-cols-[150px_1fr_150px_auto] sm:items-end">
                  <input type="hidden" name="id" value={i.id} />
                  <Field label="How it arrived" name={`m-${i.id}`}>
                    <select id={`m-${i.id}`} name="method" className={inputClass} defaultValue="bank">
                      <option value="bank">Bank transfer</option>
                      <option value="esewa">eSewa</option>
                      <option value="khalti">Khalti</option>
                      <option value="cash">Cash</option>
                      <option value="waived">Written off</option>
                    </select>
                  </Field>
                  <Field label="Reference" name={`r-${i.id}`} hint="What the bank statement calls it. Optional.">
                    <input id={`r-${i.id}`} name="reference" className={inputClass} placeholder="NIC Asia 9051..." />
                  </Field>
                  <Field label="Received on" name={`d-${i.id}`}>
                    <input id={`d-${i.id}`} name="paid_on" type="date" className={inputClass} />
                  </Field>
                  <SubmitButton pendingLabel="Recording" doneLabel="Recorded">Mark paid</SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="border-b border-line bg-wash/60 px-5 py-3">
          <h2 className="h-tight text-[15px]">Every consultancy</h2>
          <p className="mt-0.5 text-[13px] text-muted">
            The ones who owe you money are at the top. Issuing a bill gives them {TERMS_DAYS} days to pay.
          </p>
        </div>
        {rows.length === 0 ? (
          <Empty icon={<Icon name="students" size={20} />} title="No consultancies yet">
            The first one to sign up appears here, on a trial, with the day it ends.
          </Empty>
        ) : (
          <div className="scroll-soft overflow-x-auto">
            <table className="w-full min-w-[640px] text-[13.5px]">
              <thead>
                <tr className="border-b border-line text-left">
                  {["Consultancy", "Where they are", "Owes", "Next bill"].map((h) => (
                    <Th key={h}>{h}</Th>
                  ))}
                  {/* Pinned to the right edge. The table is wider than a
                      laptop and the one control on each row was the part that
                      scrolled out of sight. */}
                  <th className="sticky right-0 bg-panel" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => <Row key={r.tenantId} r={r} />)}
              </tbody>
            </table>
          </div>
        )}
        <p className="border-t border-line px-5 py-3 text-[12.5px] leading-relaxed text-muted">
          Invoices are issued by {LEGAL.entity}, {LEGAL.place}, PAN {LEGAL.pan}. There is no payment
          gateway yet, so a consultancy pays by bank transfer and you record it above. Nothing here
          changes when a gateway is added; it will mark these same invoices paid by itself.
        </p>
      </Card>
    </div>
  );
}

function Row({ r }: { r: AccountRow }) {
  const s = STATUS[r.status] ?? STATUS.trial;
  return (
    <tr>
      <td className="px-4 py-2.5">
        <span className="block font-semibold text-ink">{r.name}</span>
        <span className="block text-[12.5px] text-muted">
          {r.planLabel} · {r.students} {r.students === 1 ? "student" : "students"}
          {!r.active && " · switched off"}
        </span>
      </td>
      <td className="px-4 py-2.5">
        <Chip tone={s.tone}>{s.label}</Chip>
        {r.status === "trial" && r.trialDaysLeft !== null && (
          <span className="mt-1 block text-[12px] text-muted">
            {r.trialDaysLeft < 0
              ? `ended ${-r.trialDaysLeft} days ago`
              : r.trialDaysLeft === 0 ? "ends today" : `${r.trialDaysLeft} days left`}
          </span>
        )}
        {r.lateDays > 0 && (
          <span className="mt-1 block text-[12px] text-danger-600">{r.lateDays} days late</span>
        )}
      </td>
      <td className="num px-4 py-2.5">
        {r.owedNpr > 0
          ? <span className="font-semibold text-danger-600">{npr(r.owedNpr)}</span>
          : <span className="text-muted">Nothing</span>}
      </td>
      <td className="num px-4 py-2.5">
        <span className="block text-ink-2">{npr(r.nextAmountNpr)}</span>
        <span className="block text-[12px] text-muted">
          {r.renewsOn ? shortDate(r.renewsOn) : "not scheduled"}
        </span>
      </td>
      <td className="sticky right-0 bg-panel px-4 py-2.5 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.12)]">
        <form action={issueInvoice}>
          <input type="hidden" name="tenant_id" value={r.tenantId} />
          <SubmitButton size="sm" variant="secondary" pendingLabel="Writing" doneLabel="Issued">
            Issue bill
          </SubmitButton>
        </form>
      </td>
    </tr>
  );
}

function Tile({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: Tone }) {
  const ink = tone === "danger" ? "text-danger-600" : tone === "gold" ? "text-gold-600" : tone === "teal" ? "text-teal-700" : "text-ink";
  return (
    <div className="rounded-2xl border border-line bg-panel px-4 py-3.5">
      <div className="text-[12px] leading-snug text-muted">{label}</div>
      <div className={`num mt-1 text-[22px] font-semibold leading-none ${ink}`}>{value}</div>
      <div className="mt-1 text-[12px] text-muted">{sub}</div>
    </div>
  );
}
