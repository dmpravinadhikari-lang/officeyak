import "server-only";
import { one } from "@/lib/db";
import type { Scope } from "@/lib/db/scope";
import { stageOf } from "@/modules/pipeline/stages";
import { ledgerFor } from "@/modules/fees/data";
import { attendanceRate, classesForStudent, daysLabel, type Enrolment } from "@/modules/classes/data";

/**
 * What the consultancy knows about a student, for the student.
 *
 * The gap this fills was easy to miss and hard to justify once seen: a parent
 * opening their progress link is shown the stage, the next action, the money
 * and who to ring. The student, whose application it is, could see none of
 * those things anywhere in the product. They had eighteen practice tools and
 * no way to answer "what is actually happening with my application".
 *
 * Every field here is something the student is already entitled to know. It
 * is their stage, their fee, their class, their counsellor. Nothing is
 * computed that the parent page does not already show, and two things are
 * deliberately absent:
 *
 *   The counsellor's private notes. A file note is a colleague writing to a
 *   colleague, and a note written knowing the student will read it is a note
 *   that stops being useful.
 *
 *   Anything about other students. Nothing here takes an id from the caller;
 *   the student id comes from the session, so there is no parameter to tamper
 *   with.
 */

export type MyFile = {
  consultancy: string;
  stage: { id: string; label: string; blurb: string } | null;
  nextAction: { text: string; due: string | null } | null;
  counsellor: { name: string; phone: string | null } | null;
  office: { name: string; phone: string | null; email: string | null } | null;
  money: {
    billed: number;
    paid: number;
    balance: number;
    /** What the consultancy charges for its own work, split from fees it passes on. */
    ours: number;
    passedThrough: number;
    lastPaidOn: string | null;
  } | null;
  classes: Array<Enrolment & { when: string; rate: number | null }>;
};

export function myFile(scope: Scope): MyFile {
  const tenant = one<{ name: string }>("SELECT name FROM tenants WHERE id = ?", scope.tenantId);

  const entry = one<{
    stage: string; next_action: string | null; next_action_due: string | null;
    counsellor_name: string | null; counsellor_phone: string | null;
    branch_name: string | null; branch_phone: string | null; branch_email: string | null;
  }>(
    `SELECT p.stage, p.next_action, p.next_action_due,
            c.full_name AS counsellor_name, c.phone AS counsellor_phone,
            br.name AS branch_name, br.phone AS branch_phone, br.email AS branch_email
       FROM pipeline_entries p
       LEFT JOIN users c ON c.id = p.counsellor_id
       LEFT JOIN branches br ON br.id = p.branch_id
      WHERE p.student_id = ? AND p.tenant_id = ?`,
    scope.userId, scope.tenantId,
  );

  const ledger = ledgerFor(scope, scope.userId);
  const hasMoney = ledger.charges.length > 0 || ledger.payments.length > 0;

  const classes = classesForStudent(scope, scope.userId)
    .filter((e) => e.status !== "left")
    .map((e) => ({
      ...e,
      when: [e.days ? daysLabel(e.days) : null, e.start_time].filter(Boolean).join(", "),
      rate: attendanceRate(scope, scope.userId, e.class_id).pct,
    }));

  const stage = entry ? stageOf(entry.stage) : null;

  return {
    consultancy: tenant?.name ?? "",
    stage: entry && stage ? { id: entry.stage, label: stage.label, blurb: stage.blurb } : null,
    nextAction: entry?.next_action
      ? { text: entry.next_action, due: entry.next_action_due }
      : null,
    counsellor: entry?.counsellor_name
      ? { name: entry.counsellor_name, phone: entry.counsellor_phone }
      : null,
    office: entry?.branch_name
      ? { name: entry.branch_name, phone: entry.branch_phone, email: entry.branch_email }
      : null,
    money: hasMoney
      ? {
          billed: ledger.billed,
          paid: ledger.paid,
          balance: ledger.balance,
          ours: ledger.ours,
          passedThrough: ledger.passedThrough,
          lastPaidOn: ledger.payments[0]?.paid_on ?? null,
        }
      : null,
    classes,
  };
}
