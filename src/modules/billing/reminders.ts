import "server-only";
import { all } from "@/lib/db";
import { queueEmail } from "@/lib/email/queue";
import { localDay, daysFromToday, shortDate } from "@/lib/dates";
import { LEGAL } from "@/lib/legal";
import { LAPSE_AFTER_DAYS, type Invoice } from "./data";

/**
 * Reminding a consultancy that it owes Straw Holdings money.
 *
 * Deliberately not part of the automations in lib/email/rules. Those are the
 * consultancy's own reminders, and every one of them has a switch on their
 * settings page so an office that finds the morning list noisy can turn it
 * off. A letter about an unpaid invoice is not that: it is one company
 * telling another that a bill is outstanding, and a bill you can silence from
 * inside the product is not a bill. So these go through queueEmail directly,
 * which does not consult anybody's preferences, under a kind that is not in
 * EMAIL_KINDS and therefore never appears as something to untick.
 *
 * The queue is right for this even though the backup alert bypassed it. That
 * one reports infrastructure being broken and must not depend on the
 * infrastructure it reports on. This is ordinary business post: it should be
 * recorded, retried when a send fails, held until morning rather than landing
 * at two in the morning, and visible afterwards in the outbox. The queue does
 * all four.
 */

/**
 * When to write, counted in days from the due date.
 *
 * Negative is before it is due, positive is after. The shape matters more
 * than the numbers: one warning while there is still time to act, one on the
 * day, then a widening gap rather than a daily drip. Chasing every morning
 * reads as a dunning machine and gets filtered; chasing at three, ten and
 * seventeen days reads as a person who has noticed.
 *
 * It stops at LAPSE_AFTER_DAYS. Past that the silence is the answer and the
 * conversation belongs on a phone, not in a fourth identical email.
 */
const STAGES = [-3, 0, 3, 10, 17, 24] as const;

type Row = Invoice & { tenant_name: string };

function subjectFor(days: number, inv: Row): string {
  if (days < 0) return `Invoice ${inv.number} is due on ${shortDate(inv.due_on)}`;
  if (days === 0) return `Invoice ${inv.number} is due today`;
  return `Invoice ${inv.number} is ${days} days overdue`;
}

function bodyFor(days: number, inv: Row, to: string): string {
  const amount = `NPR ${inv.amount_npr.toLocaleString("en-IN")}`;
  const opening = days < 0
    ? `This is a note that invoice ${inv.number} falls due on ${shortDate(inv.due_on)}.`
    : days === 0
      ? `Invoice ${inv.number} is due today.`
      : `Invoice ${inv.number} was due on ${shortDate(inv.due_on)}, which was ${days} days ago.`;

  const closing = days >= 17
    ? "If something is wrong with this invoice, or the timing is difficult, tell us and we will sort it out. We would rather hear from you than keep sending these."
    : "If it is already paid, thank you, and please ignore this.";

  return [
    `Dear ${inv.tenant_name},`,
    "",
    opening,
    "",
    `Amount:  ${amount}`,
    `Period:  ${shortDate(inv.period_from)} to ${shortDate(inv.period_to)}`,
    `Due:     ${shortDate(inv.due_on)}`,
    "",
    "Your invoices are listed under Account and plan inside OfficeYak, with what",
    "is outstanding and what has been settled.",
    "",
    closing,
    "",
    `${LEGAL.entity}`,
    `${LEGAL.place}`,
    `PAN ${LEGAL.pan}`,
    ...(to ? ["", `Questions about this invoice: ${to}`] : []),
  ].join("\n");
}

/**
 * Writes today's reminders into the queue. Called by the daily run.
 *
 * Returns what it wrote rather than what it sent, because sending is the
 * queue's job and happens in the same run a moment later.
 */
export function billingReminders(today = localDay()) {
  /*
   * A billing address, only if one has been configured.
   *
   * The product sends as no-reply@officeyak.com and the domain has no inbox
   * behind it yet, so a consultancy that replies to this gets a bounce. An
   * invoice reminder with no way to answer it is worse than a slightly later
   * one, but inventing an address that also bounces would be worse still. So
   * the line appears when there is somewhere real to point at and is left out
   * entirely when there is not.
   */
  const contact = (process.env.OFFICEYAK_BILLING_EMAIL || "").trim();

  const unpaid = all<Row>(
    `SELECT i.*, t.name AS tenant_name
       FROM subscription_invoices i
       JOIN tenants t ON t.id = i.tenant_id
      WHERE i.paid_on IS NULL AND t.active = 1`,
  );

  let written = 0, duplicates = 0, noRecipient = 0;

  for (const inv of unpaid) {
    const days = -daysFromToday(inv.due_on);
    if (!STAGES.includes(days as (typeof STAGES)[number])) continue;
    if (days >= LAPSE_AFTER_DAYS) continue;

    // Whoever runs the consultancy. Not the counsellors: this is the owner's
    // post, and a bill forwarded around an office is how a bill gets ignored.
    const admins = all<{ id: string }>(
      `SELECT id FROM users
        WHERE tenant_id = ? AND active = 1 AND role IN ('tenant_admin','super_admin')`,
      inv.tenant_id,
    );
    if (admins.length === 0) { noRecipient++; continue; }

    for (const a of admins) {
      const r = queueEmail({
        tenantId: inv.tenant_id,
        userId: a.id,
        // Not an EmailKind on purpose: it must never appear on the
        // notification settings page as something to switch off.
        kind: "billing.invoice",
        subject: subjectFor(days, inv),
        body: bodyFor(days, inv, contact),
        dedupeKey: `billing:${inv.id}:d${days}:${a.id}`,
      });
      if (r === "queued") written++; else duplicates++;
    }
  }

  return { considered: unpaid.length, written, duplicates, noRecipient, today };
}
