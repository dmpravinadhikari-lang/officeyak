import { all, one, now, run, uid } from "@/lib/db";
import type { Scope } from "@/lib/db/scope";
import { branchFilter } from "@/lib/db/scope";
import { localDay } from "@/lib/dates";

/**
 * Classes, the half of test preparation that happens before a mock test.
 *
 * A consultancy sells six weeks of teaching and then a paper to sit at the
 * end of it. The paper was modelled in detail and the six weeks were not, so
 * a student could have a band score in the system and no record of ever
 * having been taught.
 *
 * A class here is a batch: a name, a teacher, a time, a set of weekdays and a
 * run of dates. Sessions are not stored. A class that runs for six weeks is
 * one row, and a particular day only becomes a fact when somebody marks the
 * register against it. Generating thirty six empty session rows in advance
 * would mean a timetable full of classes that never happened.
 */

/* Sunday first, because the Nepali working week is Sunday to Friday. */
export const WEEKDAYS = [
  { n: 0, short: "Sun", label: "Sunday" },
  { n: 1, short: "Mon", label: "Monday" },
  { n: 2, short: "Tue", label: "Tuesday" },
  { n: 3, short: "Wed", label: "Wednesday" },
  { n: 4, short: "Thu", label: "Thursday" },
  { n: 5, short: "Fri", label: "Friday" },
  { n: 6, short: "Sat", label: "Saturday" },
] as const;

export const SUBJECTS = [
  { id: "ielts", label: "IELTS" },
  { id: "pte", label: "PTE" },
  { id: "toefl", label: "TOEFL" },
  { id: "duolingo", label: "Duolingo" },
  { id: "other", label: "Other" },
] as const;

export const CLASS_STATUSES = [
  { id: "planned", label: "Planned", tone: "grey" },
  { id: "running", label: "Running", tone: "teal" },
  { id: "finished", label: "Finished", tone: "grey" },
  { id: "cancelled", label: "Cancelled", tone: "danger" },
] as const;

export type ClassRow = {
  id: string; tenant_id: string; branch_id: string | null;
  name: string; subject: string; teacher_id: string | null;
  starts_on: string | null; ends_on: string | null;
  days: string; start_time: string | null; end_time: string | null;
  room: string | null; capacity: number | null; status: string;
  note: string | null; created_at: string; updated_at: string;
  teacher_name?: string | null; branch_name?: string | null;
  enrolled?: number;
};

export const dayNumbers = (days: string): number[] =>
  String(days ?? "").split(",").map((d) => Number(d.trim())).filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);

export const daysLabel = (days: string): string => {
  const ns = dayNumbers(days);
  if (ns.length === 0) return "No days set";
  if (ns.length === 6 && !ns.includes(6)) return "Sunday to Friday";
  if (ns.length === 5 && !ns.includes(5) && !ns.includes(6)) return "Sunday to Thursday";
  return ns.map((n) => WEEKDAYS[n].short).join(", ");
};

/** Whether this class actually meets on a given date. */
export function meetsOn(c: ClassRow, day: string): boolean {
  if (c.status === "cancelled") return false;
  if (c.starts_on && day < c.starts_on) return false;
  if (c.ends_on && day > c.ends_on) return false;
  // Parsed as UTC noon so a timezone never shifts the weekday by one.
  const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
  return dayNumbers(c.days).includes(weekday);
}

const SELECT = `
  SELECT c.*,
         u.full_name AS teacher_name,
         b.name      AS branch_name,
         (SELECT COUNT(*) FROM class_enrolments e
           WHERE e.class_id = c.id AND e.status = 'active') AS enrolled
    FROM classes c
    LEFT JOIN users    u ON u.id = c.teacher_id
    LEFT JOIN branches b ON b.id = c.branch_id
   WHERE c.tenant_id = ?`;

export function classesFor(scope: Scope): ClassRow[] {
  const b = branchFilter(scope, "c");
  return all<ClassRow>(
    `${SELECT} ${b.sql} ORDER BY CASE c.status WHEN 'running' THEN 0 WHEN 'planned' THEN 1 ELSE 2 END, c.start_time, c.name`,
    scope.tenantId, ...b.params,
  );
}

export const classById = (scope: Scope, id: string): ClassRow | null =>
  one<ClassRow>(`${SELECT} AND c.id = ?`, scope.tenantId, id);

/** Today's timetable: which classes meet, in the order of the day. */
export function timetableFor(scope: Scope, day = localDay()): ClassRow[] {
  return classesFor(scope)
    .filter((c) => meetsOn(c, day))
    .sort((a, b) => String(a.start_time ?? "99").localeCompare(String(b.start_time ?? "99")));
}

export type Enrolment = {
  id: string; class_id: string; student_id: string; joined_on: string;
  left_on: string | null; status: string;
  student_name?: string; class_name?: string; subject?: string;
  start_time?: string | null; days?: string;
};

export const rosterFor = (scope: Scope, classId: string): Enrolment[] =>
  all<Enrolment>(
    `SELECT e.*, u.full_name AS student_name
       FROM class_enrolments e JOIN users u ON u.id = e.student_id
      WHERE e.tenant_id = ? AND e.class_id = ?
      ORDER BY e.status, u.full_name`,
    scope.tenantId, classId,
  );

export const classesForStudent = (scope: Scope, studentId: string): Enrolment[] =>
  all<Enrolment>(
    `SELECT e.*, c.name AS class_name, c.subject, c.start_time, c.days
       FROM class_enrolments e JOIN classes c ON c.id = e.class_id
      WHERE e.tenant_id = ? AND e.student_id = ?
      ORDER BY e.status, c.name`,
    scope.tenantId, studentId,
  );

/**
 * How often a student has actually turned up.
 *
 * Counted against sessions marked rather than against sessions the timetable
 * says should have happened. A class cancelled for Dashain should not make
 * every student look absent.
 */
export function attendanceRate(scope: Scope, studentId: string, classId?: string) {
  const rows = all<{ present: number; n: number }>(
    `SELECT present, COUNT(*) AS n FROM class_attendance
      WHERE tenant_id = ? AND student_id = ? ${classId ? "AND class_id = ?" : ""}
      GROUP BY present`,
    ...(classId ? [scope.tenantId, studentId, classId] : [scope.tenantId, studentId]),
  );
  const present = rows.find((r) => r.present === 1)?.n ?? 0;
  const absent = rows.find((r) => r.present === 0)?.n ?? 0;
  const total = present + absent;
  return { present, absent, total, pct: total ? Math.round((present / total) * 100) : null };
}

/** The register for one class on one day, with anybody not yet marked. */
export function registerFor(scope: Scope, classId: string, day: string) {
  const marked = all<{ student_id: string; present: number; note: string | null }>(
    "SELECT student_id, present, note FROM class_attendance WHERE tenant_id = ? AND class_id = ? AND on_date = ?",
    scope.tenantId, classId, day,
  );
  const byId = new Map(marked.map((m) => [m.student_id, m]));
  return rosterFor(scope, classId)
    .filter((e) => e.status === "active")
    .map((e) => ({
      ...e,
      present: byId.has(e.student_id) ? byId.get(e.student_id)!.present === 1 : null,
      note: byId.get(e.student_id)?.note ?? null,
    }));
}

/* ------------------------------------------------------------------ writes */

export function createClass(
  scope: Scope,
  input: Partial<ClassRow> & { name: string },
): string {
  const id = uid();
  const t = now();
  run(
    `INSERT INTO classes (id, tenant_id, branch_id, name, subject, teacher_id, starts_on, ends_on,
                          days, start_time, end_time, room, capacity, status, note, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    id, scope.tenantId, input.branch_id ?? scope.branchId ?? null,
    input.name.trim(), input.subject ?? "ielts", input.teacher_id ?? null,
    input.starts_on ?? null, input.ends_on ?? null,
    input.days ?? "0,1,2,3,4", input.start_time ?? null, input.end_time ?? null,
    input.room ?? null, input.capacity ?? null, input.status ?? "running",
    input.note ?? null, t, t,
  );
  return id;
}

export function updateClass(scope: Scope, id: string, patch: Partial<ClassRow>): void {
  const allowed = ["name", "subject", "teacher_id", "starts_on", "ends_on", "days",
    "start_time", "end_time", "room", "capacity", "status", "note"] as const;
  const sets: string[] = [];
  const params: (string | number | null)[] = [];
  for (const k of allowed) {
    if (patch[k] !== undefined) { sets.push(`${k} = ?`); params.push(patch[k] as string | number | null); }
  }
  if (!sets.length) return;
  run(`UPDATE classes SET ${sets.join(", ")}, updated_at = ? WHERE id = ? AND tenant_id = ?`,
    ...params, now(), id, scope.tenantId);
}

export function enrol(scope: Scope, classId: string, studentId: string): void {
  // Re-enrolling somebody who left reopens their row rather than making a
  // second one, so their attendance history stays in one place.
  run(
    `INSERT INTO class_enrolments (id, tenant_id, class_id, student_id, joined_on, status, created_at)
     VALUES (?,?,?,?,?,?,?)
     ON CONFLICT(class_id, student_id) DO UPDATE SET status = 'active', left_on = NULL`,
    uid(), scope.tenantId, classId, studentId, localDay(), "active", now(),
  );
}

export function setEnrolmentStatus(scope: Scope, id: string, status: string): void {
  if (!["active", "left", "completed"].includes(status)) return;
  run(
    "UPDATE class_enrolments SET status = ?, left_on = ? WHERE id = ? AND tenant_id = ?",
    status, status === "active" ? null : localDay(), id, scope.tenantId,
  );
}

export function mark(
  scope: Scope,
  input: { classId: string; studentId: string; day: string; present: boolean; note?: string | null },
): void {
  run(
    `INSERT INTO class_attendance (id, tenant_id, class_id, student_id, on_date, present, note, marked_by, created_at)
     VALUES (?,?,?,?,?,?,?,?,?)
     ON CONFLICT(class_id, student_id, on_date)
     DO UPDATE SET present = excluded.present, note = excluded.note, marked_by = excluded.marked_by`,
    uid(), scope.tenantId, input.classId, input.studentId, input.day,
    input.present ? 1 : 0, input.note ?? null, scope.userId, now(),
  );
}
