import "server-only";
import { all, one, run, uid, now } from "@/lib/db";
import { addDays, localDay, daysFromToday } from "@/lib/dates";
import { PLANS, planOf } from "@/lib/plans";

/**
 * What a consultancy owes Straw Holdings for OfficeYak.
 *
 * Not to be confused with modules/fees, which is a consultancy charging its
 * own families. This is the other direction: the software's own revenue.
 *
 * None of this existed. A consultancy signed up, got the Starter plan, and
 * the product never again formed an opinion about money. The plan limits were
 * enforced honestly, so nobody could take more than they had paid for, but
 * nothing recorded when an account started, what it was worth, whether anyone
 * had ever paid, or when they were next due. "Start free" on the pricing page
 * was not a marketing line, it was a complete description of the business
 * model.
 *
 * The gateway is deliberately not here. Straw Holdings invoices and takes a
 * bank transfer, which is how almost every Nepali business buys software, and
 * the records below are what make that a business rather than a memory. When
 * eSewa or Khalti is added it marks these same invoices paid; nothing here
 * changes.
 */

/**
 * How long a consultancy gets before the first bill.
 *
 * Thirty days rather than the fourteen that software companies elsewhere use.
 * A consultancy owner does not evaluate this in an afternoon: they try it on
 * one branch, wait for a counsellor to complain, and decide at the end of the
 * month when they can see whether anything got easier. Fourteen days ends
 * before that conversation happens.
 */
export const TRIAL_DAYS = 30;

/** How long they have to pay once an invoice is issued. */
export const TERMS_DAYS = 14;

/** How long past due before it stops being a reminder and becomes a decision. */
export const LAPSE_AFTER_DAYS = 30;

export type Subscription = {
  tenant_id: string;
  status: string;
  trial_ends_on: string | null;
  renews_on: string | null;
  cycle: string;
  agreed_npr: number | null;
  note: string | null;
  started_at: string;
  updated_at: string;
};

export type Invoice = {
  id: string;
  tenant_id: string;
  number: string;
  plan: string;
  period_from: string;
  period_to: string;
  amount_npr: number;
  issued_on: string;
  due_on: string;
  paid_on: string | null;
  method: string | null;
  reference: string | null;
  note: string | null;
};

/**
 * Every consultancy has a subscription row from the moment it signs up.
 *
 * This exists for the ones that signed up before any of this was written, and
 * for the awkward minute during a deploy when a row has not been backfilled
 * yet. It never throws, because a missing billing row should not be able to
 * take somebody's dashboard down over money they do not yet owe.
 */
export function subscriptionFor(tenantId: string): Subscription {
  const row = one<Subscription>("SELECT * FROM subscriptions WHERE tenant_id = ?", tenantId);
  if (row) return row;
  return {
    tenant_id: tenantId,
    status: "trial",
    trial_ends_on: addDays(localDay(), TRIAL_DAYS),
    renews_on: null,
    cycle: "monthly",
    agreed_npr: null,
    note: null,
    started_at: now(),
    updated_at: now(),
  };
}

/** Called once, when a consultancy signs up. */
export function startTrial(tenantId: string, today = localDay()) {
  run(
    `INSERT OR IGNORE INTO subscriptions
       (tenant_id, status, trial_ends_on, renews_on, cycle, started_at, updated_at)
     VALUES (?, 'trial', ?, NULL, 'monthly', ?, ?)`,
    tenantId, addDays(today, TRIAL_DAYS), now(), now(),
  );
}

export function invoicesFor(tenantId: string): Invoice[] {
  return all<Invoice>(
    "SELECT * FROM subscription_invoices WHERE tenant_id = ? ORDER BY issued_on DESC, number DESC",
    tenantId,
  );
}

/** What this consultancy is billed each period, list price unless one was agreed. */
export function amountFor(sub: Subscription, plan: string): number {
  if (sub.agreed_npr !== null && sub.agreed_npr >= 0) return sub.agreed_npr;
  const p = planOf(plan);
  const monthly = p.priceNpr;
  return sub.cycle === "yearly" ? monthly * 12 : monthly;
}

export type BillingState = {
  sub: Subscription;
  invoices: Invoice[];
  /** What the status actually is today, rather than what was last written down. */
  status: "trial" | "active" | "overdue" | "lapsed" | "cancelled";
  /** Days until the trial ends. Negative once it has passed. */
  trialDaysLeft: number | null;
  /** Unpaid, issued, totalled. */
  owedNpr: number;
  /** How late the oldest unpaid invoice is, in days. Zero when nothing is late. */
  lateDays: number;
  /** What the next bill will be for. */
  nextAmountNpr: number;
};

/**
 * The truth about one consultancy's account, worked out from the invoices
 * rather than read from a status column.
 *
 * A stored status is a claim about the past that goes stale the night an
 * invoice passes its due date, and it only stays correct if something runs
 * every night to update it. Deriving it means the screen is right even if the
 * scheduled job has been broken for a week, which, given that nothing
 * currently watches the scheduled jobs, is not a hypothetical.
 */
export function billingFor(tenantId: string, plan: string, today = localDay()): BillingState {
  const sub = subscriptionFor(tenantId);
  const invoices = invoicesFor(tenantId);
  const unpaid = invoices.filter((i) => !i.paid_on);
  const owedNpr = unpaid.reduce((n, i) => n + i.amount_npr, 0);

  const overdue = unpaid.filter((i) => i.due_on < today);
  const lateDays = overdue.length === 0
    ? 0
    : Math.max(...overdue.map((i) => -daysFromToday(i.due_on)));

  const trialDaysLeft = sub.trial_ends_on ? daysFromToday(sub.trial_ends_on) : null;
  const everPaid = invoices.some((i) => i.paid_on);

  let status: BillingState["status"];
  if (sub.status === "cancelled") status = "cancelled";
  else if (lateDays >= LAPSE_AFTER_DAYS) status = "lapsed";
  else if (overdue.length > 0) status = "overdue";
  else if (everPaid || unpaid.length > 0) status = "active";
  else if (trialDaysLeft !== null && trialDaysLeft < 0) status = "lapsed";
  else status = "trial";

  return {
    sub, invoices, status, trialDaysLeft, owedNpr, lateDays,
    nextAmountNpr: amountFor(sub, plan),
  };
}

/**
 * The next invoice reference.
 *
 * Sequential within the year and never reused, because an accountant
 * reconciles a bank statement against this string and a repeated number costs
 * a fortnight of email. Derived from what is already in the table rather than
 * from a counter, so it survives a restore.
 */
export function nextInvoiceNumber(today = localDay()): string {
  const year = today.slice(0, 4);
  const last = one<{ number: string }>(
    "SELECT number FROM subscription_invoices WHERE number LIKE ? ORDER BY number DESC LIMIT 1",
    `OY-${year}-%`,
  );
  const n = last ? Number(last.number.slice(-4)) + 1 : 1;
  return `OY-${year}-${String(n).padStart(4, "0")}`;
}

export type AccountRow = {
  tenantId: string;
  name: string;
  plan: string;
  planLabel: string;
  active: boolean;
  status: BillingState["status"];
  owedNpr: number;
  lateDays: number;
  trialDaysLeft: number | null;
  renewsOn: string | null;
  nextAmountNpr: number;
  students: number;
};

/**
 * Every consultancy, worst first.
 *
 * The order is the whole point. Somebody running this opens it to answer one
 * question, "who do I need to chase today", and a list sorted by name makes
 * them read all of it to find out.
 */
export function accounts(today = localDay()): AccountRow[] {
  const tenants = all<{ id: string; name: string; plan: string; active: number }>(
    "SELECT id, name, plan, active FROM tenants WHERE kind = 'consultancy' ORDER BY name",
  );
  const counts = new Map(
    all<{ tenant_id: string; n: number }>(
      `SELECT tenant_id, COUNT(*) AS n FROM users WHERE role = 'student' GROUP BY tenant_id`,
    ).map((r) => [r.tenant_id, r.n]),
  );

  const rows = tenants.map((t) => {
    const b = billingFor(t.id, t.plan, today);
    return {
      tenantId: t.id,
      name: t.name,
      plan: t.plan,
      planLabel: planOf(t.plan).label,
      active: String(t.active) === "1",
      status: b.status,
      owedNpr: b.owedNpr,
      lateDays: b.lateDays,
      trialDaysLeft: b.trialDaysLeft,
      renewsOn: b.sub.renews_on,
      nextAmountNpr: b.nextAmountNpr,
      students: counts.get(t.id) ?? 0,
    };
  });

  const rank: Record<string, number> = { overdue: 0, lapsed: 1, trial: 2, active: 3, cancelled: 4 };
  return rows.sort((a, b) =>
    (rank[a.status] - rank[b.status]) || (b.lateDays - a.lateDays) || (b.owedNpr - a.owedNpr));
}

/** The four numbers worth putting above the list. */
export function revenueSummary(today = localDay()) {
  const rows = accounts(today);
  const owed = rows.reduce((n, r) => n + r.owedNpr, 0);
  const paying = rows.filter((r) => r.status === "active" || r.status === "overdue");
  const monthly = paying.reduce((n, r) => n + (r.nextAmountNpr), 0);
  return {
    owed,
    monthly,
    paying: paying.length,
    trials: rows.filter((r) => r.status === "trial").length,
    chasing: rows.filter((r) => r.status === "overdue" || r.status === "lapsed").length,
  };
}

/** Everything unpaid across every consultancy, oldest first. */
export function unpaidInvoices(today = localDay()) {
  return all<Invoice & { tenant_name: string }>(
    `SELECT i.*, t.name AS tenant_name
       FROM subscription_invoices i
       JOIN tenants t ON t.id = i.tenant_id
      WHERE i.paid_on IS NULL
      ORDER BY i.due_on`,
  ).map((i) => ({ ...i, lateDays: Math.max(0, -daysFromToday(i.due_on)) }));
}

export const PLAN_CHOICES = Object.entries(PLANS)
  .filter(([, p]) => p.audience === "consultancy")
  .map(([id, p]) => ({ id, label: p.label, priceNpr: p.priceNpr }));

