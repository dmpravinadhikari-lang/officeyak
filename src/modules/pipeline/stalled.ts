import "server-only";
import { all } from "@/lib/db";
import { branchFilter, type Scope } from "@/lib/db/scope";
import { localDay } from "@/lib/dates";

/**
 * Files that have stopped moving.
 *
 * This already existed, buried inside the weekly email rule, which meant the
 * only way to learn that a student had sat in one stage for two months was to
 * be the counsellor on the file and to have that email switched on. The owner
 * who is paying for the office could not see it anywhere, and an alert nobody
 * with authority receives is not an alert.
 *
 * So the definition lives here, the email uses it, and the app shows it.
 *
 * The thresholds are per stage and they are not arbitrary:
 *
 *   enquiry       2 days. Somebody who walked in and was never rung again is
 *                 the single most expensive thing that happens in a
 *                 consultancy, and two days is already generous.
 *   counselling  21 days. Choosing a country takes weeks; three of them with
 *                 no recorded movement means the conversation has died.
 *   test_prep    90 days. An IELTS course is months long and a file sitting
 *                 here is usually fine.
 *   applying     30 days. Universities answer in weeks.
 *   offer        30 days. Fees and NOC have a rhythm; a month of silence after
 *                 an offer is how deposits get missed.
 *   visa         60 days. Embassies are slow and nobody can hurry them.
 *
 * departed and lost are absent on purpose. A file that has finished is not
 * stalled, and a weekly list that includes them is a list people stop reading.
 */
export const STALE_AFTER: Record<string, number> = {
  enquiry: 2, counselling: 21, test_prep: 90, applying: 30, offer: 30, visa: 60,
};

export type StalledFile = {
  student_id: string;
  student_name: string;
  stage: string;
  counsellor_id: string | null;
  counsellor_name: string | null;
  branch_name: string | null;
  /** Days since the file last changed stage, or since it was created. */
  days: number;
  /** What the stage allows before it counts as stalled. */
  cap: number;
  /** How far past that it is. Sorting by this puts the worst first. */
  over: number;
};

/**
 * Every file past its stage's patience, worst first.
 *
 * Measured from the last recorded stage change rather than from any edit,
 * because a counsellor who opens a file and changes a phone number has not
 * moved it forward, and counting that as movement is how a board stays green
 * while nothing happens.
 */
export function stalledFiles(scope: Scope, today = localDay()): StalledFile[] {
  const b = branchFilter(scope, "p");
  const rows = all<{
    student_id: string; student_name: string; stage: string;
    counsellor_id: string | null; counsellor_name: string | null;
    branch_name: string | null; since: string;
  }>(
    `SELECT p.student_id, s.full_name AS student_name, p.stage,
            p.counsellor_id, c.full_name AS counsellor_name,
            br.name AS branch_name,
            COALESCE((SELECT MAX(a.created_at) FROM activity_log a
                       WHERE a.student_id = p.student_id AND a.kind = 'stage.changed'),
                     p.created_at) AS since
       FROM pipeline_entries p
       JOIN users s ON s.id = p.student_id
       LEFT JOIN users c ON c.id = p.counsellor_id
       LEFT JOIN branches br ON br.id = p.branch_id
      WHERE p.tenant_id = ? AND p.stage NOT IN ('departed','lost')${b.sql}`,
    scope.tenantId, ...b.params,
  );

  const stamp = Date.parse(`${today}T00:00:00Z`);
  return rows
    .map((r) => {
      const cap = STALE_AFTER[r.stage];
      const days = Math.floor((stamp - Date.parse(r.since)) / 864e5);
      return { ...r, days, cap: cap ?? 0, over: cap === undefined ? -1 : days - cap };
    })
    .filter((r) => r.over > 0)
    .sort((a, z) => z.over - a.over);
}

/** The one number a dashboard needs, and the worst file to name beside it. */
export function stalledSummary(scope: Scope, today = localDay()) {
  const list = stalledFiles(scope, today);
  return { count: list.length, worst: list[0] ?? null, list };
}
