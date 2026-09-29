"use server";

import { revalidatePath } from "next/cache";
import { requireCapability } from "@/lib/auth/guard";
import { one, run, uid, now } from "@/lib/db";
import { addDays, localDay } from "@/lib/dates";
import {
  amountFor, nextInvoiceNumber, subscriptionFor, TERMS_DAYS, TRIAL_DAYS,
  type Invoice,
} from "./data";

/**
 * Issuing and settling the bills for OfficeYak itself.
 *
 * Every one of these is guarded by platform:tenants, the capability that
 * already gates the admin panel. A consultancy owner is an admin of their own
 * consultancy and must never be able to mark their own invoice paid, which is
 * the one mistake in this file that would cost real money.
 */

/** The last day of a period that starts on `from` and runs for `months`. */
function periodEnd(from: string, months: number): string {
  const [y, m, d] = from.split("-").map(Number);
  const end = new Date(Date.UTC(y, m - 1 + months, d));
  end.setUTCDate(end.getUTCDate() - 1);
  return end.toISOString().slice(0, 10);
}

/**
 * Write the next bill.
 *
 * The period starts where the last one finished rather than today, so a bill
 * raised three days late still covers the month it was for and the
 * consultancy is never charged twice for the same week.
 */
export async function issueInvoice(formData: FormData) {
  await requireCapability("platform:tenants");
  const tenantId = String(formData.get("tenant_id") ?? "");
  if (!tenantId) return;

  const tenant = one<{ plan: string }>("SELECT plan FROM tenants WHERE id = ?", tenantId);
  if (!tenant) return;

  const sub = subscriptionFor(tenantId);
  const today = localDay();
  const months = sub.cycle === "yearly" ? 12 : 1;
  const from = sub.renews_on ?? today;
  const to = periodEnd(from, months);
  const amount = amountFor(sub, tenant.plan);

  run(
    `INSERT INTO subscription_invoices
       (id, tenant_id, number, plan, period_from, period_to, amount_npr,
        issued_on, due_on, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    uid(), tenantId, nextInvoiceNumber(today), tenant.plan, from, to, amount,
    today, addDays(today, TERMS_DAYS), now(),
  );

  // The next period begins the day after this one ends, and the trial is over
  // the moment the first bill exists.
  run(
    `INSERT INTO subscriptions (tenant_id, status, trial_ends_on, renews_on, cycle, started_at, updated_at)
          VALUES (?, 'active', NULL, ?, ?, ?, ?)
     ON CONFLICT(tenant_id) DO UPDATE SET
       status = 'active', trial_ends_on = NULL, renews_on = excluded.renews_on, updated_at = excluded.updated_at`,
    tenantId, addDays(to, 1), sub.cycle, now(), now(),
  );

  revalidatePath("/app/admin/billing");
  revalidatePath("/app/billing");
}

/** The money arrived. */
export async function markInvoicePaid(formData: FormData) {
  await requireCapability("platform:tenants");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const invoice = one<Invoice>("SELECT * FROM subscription_invoices WHERE id = ?", id);
  if (!invoice || invoice.paid_on) return;

  const method = String(formData.get("method") ?? "bank");
  const reference = String(formData.get("reference") ?? "").trim() || null;
  const paidOn = String(formData.get("paid_on") ?? "").trim() || localDay();

  run(
    "UPDATE subscription_invoices SET paid_on = ?, method = ?, reference = ? WHERE id = ?",
    paidOn, method, reference, id,
  );
  run(
    "UPDATE subscriptions SET status = 'active', updated_at = ? WHERE tenant_id = ?",
    now(), invoice.tenant_id,
  );
  revalidatePath("/app/admin/billing");
  revalidatePath("/app/billing");
}

/**
 * What this consultancy actually pays, and when.
 *
 * agreed_npr exists because a consultancy talked down from 12,999 to 9,999 is
 * an ordinary Tuesday, and without somewhere to record it the discount has to
 * be remembered and re-applied by hand every single month until somebody
 * forgets and sends the list price to a customer who will notice.
 */
export async function setBillingTerms(formData: FormData) {
  await requireCapability("platform:tenants");
  const tenantId = String(formData.get("tenant_id") ?? "");
  if (!tenantId) return;

  const cycle = String(formData.get("cycle") ?? "monthly") === "yearly" ? "yearly" : "monthly";
  const rawAgreed = String(formData.get("agreed_npr") ?? "").trim();
  const agreed = rawAgreed === "" ? null : Math.max(0, Math.round(Number(rawAgreed) || 0));
  const note = String(formData.get("note") ?? "").trim() || null;
  const trialEnds = String(formData.get("trial_ends_on") ?? "").trim() || null;

  run(
    `INSERT INTO subscriptions (tenant_id, status, trial_ends_on, cycle, agreed_npr, note, started_at, updated_at)
          VALUES (?, 'trial', ?, ?, ?, ?, ?, ?)
     ON CONFLICT(tenant_id) DO UPDATE SET
       trial_ends_on = excluded.trial_ends_on,
       cycle         = excluded.cycle,
       agreed_npr    = excluded.agreed_npr,
       note          = excluded.note,
       updated_at    = excluded.updated_at`,
    tenantId, trialEnds, cycle, agreed, note, now(), now(),
  );
  revalidatePath("/app/admin/billing");
}

/** They left. Kept as a status rather than a deletion, so the history stands. */
export async function setSubscriptionStatus(formData: FormData) {
  await requireCapability("platform:tenants");
  const tenantId = String(formData.get("tenant_id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!tenantId || !["trial", "active", "cancelled"].includes(status)) return;

  const trialEnds = status === "trial" ? addDays(localDay(), TRIAL_DAYS) : null;
  run(
    `INSERT INTO subscriptions (tenant_id, status, trial_ends_on, started_at, updated_at)
          VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(tenant_id) DO UPDATE SET
       status = excluded.status, trial_ends_on = excluded.trial_ends_on, updated_at = excluded.updated_at`,
    tenantId, status, trialEnds, now(), now(),
  );
  revalidatePath("/app/admin/billing");
}
