import "server-only";
import { all } from "@/lib/db";
import { branchFilter, type Scope } from "@/lib/db/scope";
import { localDay } from "@/lib/dates";

/**
 * The two desks that had no screen.
 *
 * A documentation officer's job, in the product's own words, is to check
 * documents and keep files complete. A visa officer's is applications, offers
 * and visa files. Both opened the console and were shown "9 students on file,
 * and nothing overdue", the same sentence a counsellor gets, because the
 * dashboard was built around leads and follow-ups and neither of them works
 * on either.
 *
 * Their work was in the database the whole time. A document sits at
 * "uploaded" until somebody checks it, and nothing counted them. An
 * application sits at "submitted" until an institution answers, and nothing
 * listed them: openApplications() was written, branch-wide and ordered by
 * deadline, and called from nowhere in the product.
 */

export type WaitingDoc = {
  id: string;
  student_id: string;
  student_name: string;
  label: string | null;
  kind: string;
  filename: string;
  created_at: string;
  /** Days since the student uploaded it and nobody looked. */
  waiting: number;
};

/**
 * Paperwork a student has sent in that nobody has checked.
 *
 * Oldest first, because the cost of this queue is not its length, it is the
 * one certificate that has sat unread for nine days while the family assumes
 * it was fine.
 */
export function documentsWaiting(scope: Scope, today = localDay()): WaitingDoc[] {
  const b = branchFilter(scope, "u");
  const rows = all<Omit<WaitingDoc, "waiting">>(
    `SELECT d.id, d.student_id, u.full_name AS student_name,
            d.label, d.kind, d.filename, d.created_at
       FROM documents d
       JOIN users u ON u.id = d.student_id
      WHERE d.tenant_id = ? AND d.status = 'uploaded'${b.sql}
      ORDER BY d.created_at`,
    scope.tenantId, ...b.params,
  );
  const stamp = Date.parse(`${today}T00:00:00Z`);
  return rows.map((r) => ({
    ...r,
    waiting: Math.max(0, Math.floor((stamp - Date.parse(r.created_at)) / 864e5)),
  }));
}

export type LiveApplication = {
  id: string;
  student_id: string;
  student_name: string;
  institution: string;
  course: string | null;
  destination: string | null;
  intake: string | null;
  status: string;
  deadline: string | null;
  updated_at: string;
  /** Days since anything changed on it. */
  quiet: number;
  /** Days until the deadline; negative once it has passed. */
  daysLeft: number | null;
};

/**
 * Every application still in play, soonest deadline first.
 *
 * This is deliberately not filtered to one person. An application is the
 * office's commitment to a family rather than one officer's task, and a
 * deadline that passes while its owner is on leave is still a lost intake.
 *
 * openApplications() already existed for this and was never called. It also
 * took a scope and then ignored it, returning every office's applications to
 * whoever asked, so this replaces it rather than wrapping it.
 */
export function liveApplications(scope: Scope, today = localDay()): LiveApplication[] {
  const b = branchFilter(scope, "a");
  const rows = all<Omit<LiveApplication, "quiet" | "daysLeft">>(
    `SELECT a.id, a.student_id, u.full_name AS student_name,
            a.institution, a.course, a.destination, a.intake,
            a.status, a.deadline, a.updated_at
       FROM applications a
       JOIN users u ON u.id = a.student_id
      WHERE a.tenant_id = ?
        AND a.status IN ('planned','submitted','conditional','offer')${b.sql}
      ORDER BY COALESCE(a.deadline, '9999-12-31'), u.full_name`,
    scope.tenantId, ...b.params,
  );
  const stamp = Date.parse(`${today}T00:00:00Z`);
  const days = (from: string) => Math.floor((stamp - Date.parse(from)) / 864e5);
  return rows.map((r) => ({
    ...r,
    quiet: Math.max(0, days(r.updated_at)),
    daysLeft: r.deadline ? -days(r.deadline.slice(0, 10)) : null,
  }));
}

/**
 * How long an institution is allowed to stay silent before somebody chases.
 *
 * Three weeks. Universities take time and a chaser after ten days annoys an
 * admissions office; a file that has been silent for a month is usually one
 * where the portal asked for something nobody saw.
 */
export const SILENT_AFTER_DAYS = 21;

/** The one line a visa officer's dashboard needs. */
export function applicationSummary(scope: Scope, today = localDay()) {
  const rows = liveApplications(scope, today);
  const dueSoon = rows.filter((r) => r.daysLeft !== null && r.daysLeft <= 14);
  const silent = rows.filter((r) => r.status === "submitted" && r.quiet >= SILENT_AFTER_DAYS);
  const offers = rows.filter((r) => r.status === "offer" || r.status === "conditional");
  return { rows, dueSoon, silent, offers };
}
