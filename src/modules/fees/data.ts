import { all, now, run, uid } from "@/lib/db";
import type { Scope } from "@/lib/db/scope";
import { branchFilter } from "@/lib/db/scope";

/**
 * What a student owes, and what they have paid.
 *
 * The consultancy has two income lines. Commission from the institution,
 * which lands a year later and is handled in partners/commission.ts, and fees
 * charged to the student directly, which is this and which is what actually
 * pays the rent in month one.
 *
 * Charges and payments are separate, and a payment is not tied to a charge.
 * A family pays fifteen thousand against a balance of forty and the rest two
 * months later; forcing that into an allocation against particular lines
 * would be inventing a decision nobody made. The balance is one sum minus the
 * other, which is also how the family thinks about it.
 *
 * Every charge says whose money it is. A government fee passed through at
 * cost and a fee for the office's own work are different things, and an
 * invoice that merges them is the single most common way a consultancy ends
 * up accused of overcharging by a family whose arithmetic is fine.
 */

export const CHARGE_KINDS = [
  { id: "ours", label: "Our fee", blurb: "For work this office does." },
  { id: "government", label: "Government fee", blurb: "Published charge, passed through at cost." },
  { id: "third_party", label: "Paid on their behalf", blurb: "A test centre, a translator, an embassy." },
] as const;

export const PAYMENT_METHODS = [
  { id: "cash", label: "Cash" },
  { id: "bank", label: "Bank transfer" },
  { id: "esewa", label: "eSewa" },
  { id: "khalti", label: "Khalti" },
  { id: "cheque", label: "Cheque" },
  { id: "other", label: "Other" },
] as const;

export type Charge = {
  id: string; student_id: string; label: string; amount_npr: number;
  kind: string; note: string | null; waived: number; created_at: string;
};

export type Payment = {
  id: string; student_id: string; amount_npr: number; method: string;
  reference: string | null; paid_on: string; note: string | null; created_at: string;
};

export type Ledger = {
  charges: Charge[];
  payments: Payment[];
  /** Waived lines are shown but are not owed. */
  billed: number;
  ours: number;
  passedThrough: number;
  paid: number;
  balance: number;
};

export function ledgerFor(scope: Scope, studentId: string): Ledger {
  const charges = all<Charge>(
    "SELECT * FROM student_charges WHERE tenant_id = ? AND student_id = ? ORDER BY created_at",
    scope.tenantId, studentId,
  );
  const payments = all<Payment>(
    "SELECT * FROM student_payments WHERE tenant_id = ? AND student_id = ? ORDER BY paid_on DESC, created_at DESC",
    scope.tenantId, studentId,
  );

  const live = charges.filter((c) => !c.waived);
  const billed = live.reduce((t, c) => t + c.amount_npr, 0);
  const paid = payments.reduce((t, p) => t + p.amount_npr, 0);

  return {
    charges, payments, billed, paid,
    ours: live.filter((c) => c.kind === "ours").reduce((t, c) => t + c.amount_npr, 0),
    passedThrough: live.filter((c) => c.kind !== "ours").reduce((t, c) => t + c.amount_npr, 0),
    balance: billed - paid,
  };
}

/**
 * The balance alone, for the student file.
 *
 * A counsellor needs to know whether a family still owes something before
 * starting the next piece of work, and that is a different question from
 * being allowed to see the ledger or take a payment. This is the number they
 * get; the detail sits behind money:view.
 */
export function balanceFor(scope: Scope, studentId: string): number {
  const billed = all<{ n: number }>(
    "SELECT COALESCE(SUM(amount_npr),0) AS n FROM student_charges WHERE tenant_id = ? AND student_id = ? AND waived = 0",
    scope.tenantId, studentId,
  )[0]?.n ?? 0;
  const paid = all<{ n: number }>(
    "SELECT COALESCE(SUM(amount_npr),0) AS n FROM student_payments WHERE tenant_id = ? AND student_id = ?",
    scope.tenantId, studentId,
  )[0]?.n ?? 0;
  return billed - paid;
}

export type Owing = {
  student_id: string; student_name: string; branch_name: string | null;
  billed: number; paid: number; balance: number; last_paid_on: string | null;
  oldest_unpaid: string | null;
};

/**
 * Everyone with an outstanding balance, worst first.
 *
 * Ordered by how long the debt has been outstanding rather than by size,
 * because an old small balance is a conversation nobody has had and a large
 * new one is usually just a family who paid the deposit last week.
 */
export function owingList(scope: Scope): Owing[] {
  const b = branchFilter(scope, "u");
  return all<Owing>(
    `SELECT u.id AS student_id,
            u.full_name AS student_name,
            br.name AS branch_name,
            COALESCE(c.billed, 0) AS billed,
            COALESCE(p.paid, 0)   AS paid,
            COALESCE(c.billed, 0) - COALESCE(p.paid, 0) AS balance,
            p.last_paid_on,
            c.oldest_unpaid
       FROM users u
       LEFT JOIN branches br ON br.id = u.branch_id
       LEFT JOIN (SELECT student_id, SUM(amount_npr) billed, MIN(created_at) oldest_unpaid
                    FROM student_charges WHERE waived = 0 GROUP BY student_id) c ON c.student_id = u.id
       LEFT JOIN (SELECT student_id, SUM(amount_npr) paid, MAX(paid_on) last_paid_on
                    FROM student_payments GROUP BY student_id) p ON p.student_id = u.id
      WHERE u.tenant_id = ? AND u.role = 'student' ${b.sql}
        AND COALESCE(c.billed, 0) - COALESCE(p.paid, 0) > 0
      ORDER BY c.oldest_unpaid`,
    scope.tenantId, ...b.params,
  );
}

/** The office-wide figures for the fees page. */
export function feeSummary(scope: Scope) {
  const b = branchFilter(scope, "u");
  const row = all<{ billed: number; paid: number; students: number }>(
    `SELECT COALESCE((SELECT SUM(amount_npr) FROM student_charges sc
                        JOIN users u ON u.id = sc.student_id
                       WHERE sc.tenant_id = ? AND sc.waived = 0 ${b.sql}), 0) AS billed,
            COALESCE((SELECT SUM(amount_npr) FROM student_payments sp
                        JOIN users u ON u.id = sp.student_id
                       WHERE sp.tenant_id = ? ${b.sql}), 0) AS paid,
            0 AS students`,
    scope.tenantId, ...b.params, scope.tenantId, ...b.params,
  )[0] ?? { billed: 0, paid: 0, students: 0 };

  const owing = owingList(scope);
  return {
    billed: row.billed,
    paid: row.paid,
    outstanding: row.billed - row.paid,
    owing,
    /* Collected as a share of billed. The number an owner checks monthly. */
    collectedPct: row.billed > 0 ? Math.round((row.paid / row.billed) * 100) : 100,
  };
}

export function addCharge(
  scope: Scope,
  input: { studentId: string; label: string; amountNpr: number; kind: string; note?: string | null; branchId?: string | null },
): void {
  const t = now();
  run(
    `INSERT INTO student_charges (id, tenant_id, student_id, branch_id, label, amount_npr, kind, note, created_by, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    uid(), scope.tenantId, input.studentId, input.branchId ?? null,
    input.label.trim(), Math.max(0, Math.round(input.amountNpr)),
    CHARGE_KINDS.some((k) => k.id === input.kind) ? input.kind : "ours",
    input.note?.trim() || null, scope.userId, t, t,
  );
}

/**
 * Waived rather than deleted.
 *
 * A discount the office agreed to is part of the story of that student, and
 * a family that was promised one should be able to see it honoured on the
 * statement rather than watching a line quietly disappear.
 */
export function waiveCharge(scope: Scope, id: string, waived: boolean): void {
  run(
    "UPDATE student_charges SET waived = ?, updated_at = ? WHERE id = ? AND tenant_id = ?",
    waived ? 1 : 0, now(), id, scope.tenantId,
  );
}

export function addPayment(
  scope: Scope,
  input: { studentId: string; amountNpr: number; method: string; reference?: string | null; paidOn?: string | null; note?: string | null; branchId?: string | null },
): void {
  run(
    `INSERT INTO student_payments (id, tenant_id, student_id, branch_id, amount_npr, method, reference, paid_on, note, recorded_by, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    uid(), scope.tenantId, input.studentId, input.branchId ?? null,
    Math.max(0, Math.round(input.amountNpr)),
    PAYMENT_METHODS.some((m) => m.id === input.method) ? input.method : "cash",
    input.reference?.trim() || null,
    input.paidOn || new Date().toISOString().slice(0, 10),
    input.note?.trim() || null, scope.userId, now(),
  );
}

export function removePayment(scope: Scope, id: string): void {
  run("DELETE FROM student_payments WHERE id = ? AND tenant_id = ?", id, scope.tenantId);
}
