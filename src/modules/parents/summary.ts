import { all, one, scalar } from "@/lib/db";
import { getProfile, profileCompleteness } from "@/lib/profile";
import { country, countryCode } from "@/lib/countries";
import { stageOf } from "@/modules/pipeline/stages";
import { requiredFor, kindById } from "@/modules/documents/kinds";
import { calculate } from "@/modules/cost/calculate";
import { ledgerFor } from "@/modules/fees/data";
import { attendanceRate, classesForStudent, daysLabel } from "@/modules/classes/data";
import type { Scope } from "@/lib/db/scope";
import { COST, type Level } from "@/modules/cost/data";
import type { CountryCode } from "@/lib/countries";

/**
 * Everything a parent is shown, and nothing else.
 *
 * Deliberately excluded: any document file, the text of the statement, any
 * interview transcript, and anything a student wrote in confidence. A parent
 * sees where their money is going and whether the application is on track.
 * That is the whole remit.
 */
export type ParentSummary = {
  studentName: string;
  consultancy: string;
  counsellor: string | null;
  counsellorPhone: string | null;
  /* The consultancy's own switchboard and inbox, so the contact card still
     has something to tap when no counsellor is assigned or the one who is
     has no number on file. */
  officePhone: string | null;
  officeEmail: string | null;
  destination: { name: string; flag: string; visa: string } | null;
  course: string | null;
  intake: string | null;
  stage: { label: string; blurb: string };
  profilePct: number;
  documents: { held: number; needed: number; stillNeeded: string[] };
  english: { claimed: string | null; bestMock: number | null };
  interview: { best: number | null; runs: number };
  nextAction: { what: string; due: string | null } | null;
  /*
   * What the family has actually been charged, as opposed to what the course
   * is estimated to cost.
   *
   * The page carried a planning estimate, a whole-course figure in crore, and
   * called that "cost". A parent reading it wanted a different and much
   * smaller number: what they owe this consultancy, and what they have
   * already handed over. Those are the only money figures on this page that
   * somebody can act on, and they were the two that were missing.
   *
   * Null when the consultancy has recorded no charges, rather than zeros,
   * because "you owe nothing" and "we have not billed you yet" are different
   * things to tell a parent.
   */
  bill: {
    charged: number;
    paid: number;
    balance: number;
    /** The consultancy's own fee, kept apart from what it passes on. */
    ours: number;
    passedThrough: number;
    lastPaidOn: string | null;
  } | null;
  /*
   * Classes, and whether they are being attended.
   *
   * The most common question a Nepali parent asks a consultancy is whether
   * their child is actually going to the class the family paid for. It sits
   * squarely inside this page's remit, which is progress and cost, and it
   * answers a question that otherwise gets asked by telephone.
   */
  classes: Array<{ name: string; when: string; attendedPct: number | null; marked: number }>;
  money: {
    wholeCourseNpr: number;
    beforeYouFlyNpr: number;
    mustShowNpr: number;
    mustShowFormula: string;
  } | null;
};

export function buildSummary(tenantId: string, studentId: string): ParentSummary | null {
  const student = one<{ full_name: string }>(
    "SELECT full_name FROM users WHERE id = ? AND tenant_id = ?", studentId, tenantId,
  );
  if (!student) return null;

  const tenant = one<{ name: string; contact_phone: string | null; contact_email: string | null }>(
    "SELECT name, contact_phone, contact_email FROM tenants WHERE id = ?", tenantId,
  );
  const entry = one<{ stage: string; next_action: string | null; next_action_due: string | null; counsellor_id: string | null }>(
    "SELECT stage, next_action, next_action_due, counsellor_id FROM pipeline_entries WHERE student_id = ? AND tenant_id = ?",
    studentId, tenantId,
  );
  const counsellor = entry?.counsellor_id
    ? one<{ full_name: string; phone: string | null }>("SELECT full_name, phone FROM users WHERE id = ?", entry.counsellor_id)
    : null;

  const profile = getProfile(studentId);
  const stage = stageOf(entry?.stage ?? "enquiry");
  const c = profile?.target_country ? country(profile.target_country) : null;

  // documents, names of what is still outstanding, never the files themselves
  const required = requiredFor(profile?.target_country ?? null, entry?.stage ?? "applying");
  const heldKinds = new Set(
    all<{ kind: string }>("SELECT DISTINCT kind FROM documents WHERE student_id = ? AND tenant_id = ?", studentId, tenantId)
      .map((r) => r.kind),
  );
  const stillNeeded = required.filter((k) => !heldKinds.has(k.id)).map((k) => kindById(k.id)?.label ?? k.id);

  const bestMock = one<{ b: number | null }>(
    "SELECT MAX(overall_band) AS b FROM test_attempts WHERE user_id = ? AND status = 'complete' AND mode = 'full'",
    studentId,
  )?.b ?? null;

  const reports = all<{ report: string | null }>(
    "SELECT report FROM interview_sessions WHERE user_id = ? AND status = 'complete'", studentId,
  );
  let bestInterview: number | null = null;
  for (const r of reports) {
    try {
      const o = r.report ? (JSON.parse(r.report) as { overall?: number }).overall : undefined;
      if (typeof o === "number" && (bestInterview === null || o > bestInterview)) bestInterview = o;
    } catch { /* ignore a malformed report */ }
  }

  const ledger = ledgerFor({ tenantId, userId: studentId, role: "student" } as Scope, studentId);
  const bill = (ledger.charges.length || ledger.payments.length)
    ? {
        charged: ledger.billed,
        paid: ledger.paid,
        balance: ledger.balance,
        ours: ledger.ours,
        passedThrough: ledger.passedThrough,
        lastPaidOn: ledger.payments[0]?.paid_on ?? null,
      }
    : null;

  const scope = { tenantId, userId: studentId, role: "student" } as Scope;
  const classes = classesForStudent(scope, studentId)
    .filter((e) => e.status !== "left")
    .map((e) => {
      const rate = attendanceRate(scope, studentId, e.class_id);
      return {
        name: e.class_name ?? "Class",
        when: [e.days ? daysLabel(e.days) : null, e.start_time].filter(Boolean).join(", "),
        attendedPct: rate.pct,
        marked: rate.total,
      };
    });

  let money: ParentSummary["money"] = null;
  // countryCode rather than the raw column: a profile saying "GB" used to
  // index the cost table with a key that is not in it, and the resulting
  // TypeError took down the whole page rather than hiding one card.
  const cc = countryCode(profile?.target_country);
  if (cc) {
    const level = (["diploma", "bachelors", "masters"].includes(profile?.study_level ?? "")
      ? profile?.study_level : "masters") as Level;
    const r = calculate({
      country: cc, level, years: COST[cc].years[level], tuition: 0,
      livingBand: "typical", londonOrEquivalent: false,
      savingsNpr: profile?.budget_npr ?? 0, sponsorIncomeNpr: profile?.sponsor_income_npr ?? 0, partTime: 0,
    });
    money = {
      wholeCourseNpr: r.wholeCourseTotal,
      beforeYouFlyNpr: r.beforeYouGoTotal,
      mustShowNpr: r.visaFunds.npr,
      mustShowFormula: r.visaFunds.formula,
    };
  }

  return {
    studentName: student.full_name,
    consultancy: tenant?.name ?? "",
    bill,
    classes,
    counsellor: counsellor?.full_name ?? null,
    counsellorPhone: counsellor?.phone ?? null,
    officePhone: tenant?.contact_phone ?? null,
    officeEmail: tenant?.contact_email ?? null,
    destination: c ? { name: c.name, flag: c.flag, visa: c.visa } : null,
    course: profile?.intended_course ?? null,
    intake: profile?.target_intake ?? null,
    stage: { label: stage.label, blurb: stage.blurb },
    profilePct: profileCompleteness(profile).pct,
    documents: { held: required.length - stillNeeded.length, needed: required.length, stillNeeded },
    english: { claimed: profile?.english_score ?? null, bestMock },
    interview: { best: bestInterview, runs: scalar("SELECT COUNT(*) FROM interview_sessions WHERE user_id = ?", studentId) },
    nextAction: entry?.next_action ? { what: entry.next_action, due: entry.next_action_due } : null,
    money,
  };
}
