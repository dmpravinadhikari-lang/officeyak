import "server-only";
import { all } from "@/lib/db";
import { branchFilter, type Scope } from "@/lib/db/scope";
import { punctuality } from "@/modules/attendance/data";
import { positionOf } from "@/lib/auth/positions";

/**
 * How each person is actually doing, for the person who has to decide.
 *
 * There is already a scorecard in this product and it is the opposite of this
 * one: it shows a counsellor their own month, it refuses to rank, and it will
 * not open anybody else's card. That rule was written for staff and it still
 * holds for staff. It was never meant to stop an owner from knowing how their
 * own office is running, which until now they could only find out by opening
 * six screens and holding the numbers in their head.
 *
 * Three decisions shape this file, and they are what make it fair enough to
 * act on:
 *
 * 1. No single score. A composite out of a hundred would let a strong
 *    counsellor at a quiet branch look worse than a weak one at a busy branch,
 *    and an owner who acted on it would be wrong in a way the number hides.
 *    Each dimension is reported on its own.
 *
 * 2. Compared against their own colleagues, not an invented benchmark. The
 *    median of this team this month is the only honest comparison, because it
 *    already contains the season, the branch, and how the office is run.
 *
 * 3. The findings name the behaviour, not the person. "Wrote no note on 9 of
 *    14 files" is something to ask about. "Poor performer" is a conclusion the
 *    data cannot support, and this file does not draw it.
 *
 * Anybody with no measurable activity in the window is still listed, marked as
 * such, rather than scoring zero. A person on leave is not underperforming.
 */

export type Dimension = {
  id: string;
  label: string;
  /** What this person did. */
  value: number;
  /** The middle of the team, for the same window. */
  median: number;
  /** How to read it: more is better, or fewer is better. */
  goodWhen: "high" | "low";
  /** Rendered after the number, e.g. "files" or "%". */
  unit: string;
  /** Why this is worth looking at, in one line, for somebody new to the page. */
  hint: string;
};

export type Finding = {
  tone: "good" | "watch" | "concern";
  text: string;
};

export type PersonAnalysis = {
  user_id: string;
  full_name: string;
  position_label: string;
  branch_name: string | null;
  /** False when there is nothing to judge: new joiner, leave, quiet desk. */
  measurable: boolean;
  dimensions: Dimension[];
  findings: Finding[];
};

type Row = { user_id: string; n: number };
const byId = (rows: Row[]) => new Map(rows.map((r) => [r.user_id, r.n]));

function median(values: number[]): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

/**
 * Everything measurable about each member of staff, between two dates.
 *
 * Nine queries rather than one joined monster, because each counts a different
 * thing over a different table and a single query would need five left joins
 * whose row multiplication silently inflates every count.
 */
export function analyseTeam(scope: Scope, from: string, to: string): PersonAnalysis[] {
  const bu = branchFilter(scope, "u");
  const people = all<{
    user_id: string; full_name: string; position: string | null; branch_name: string | null;
  }>(
    `SELECT u.id AS user_id, u.full_name, u.position, br.name AS branch_name
       FROM users u
       LEFT JOIN branches br ON br.id = u.branch_id
      WHERE u.tenant_id = ? AND u.role <> 'student' AND u.active = 1${bu.sql}
      ORDER BY br.name, u.full_name`,
    scope.tenantId, ...bu.params,
  );
  if (!people.length) return [];

  const ids = people.map((p) => p.user_id);
  const holes = ids.map(() => "?").join(",");
  const range = [from, `${to}T23:59:59`];

  /* --- what they did to student files ---------------------------------- */
  const activity = (kind: string) => byId(all<Row>(
    `SELECT actor_id AS user_id, COUNT(*) n FROM activity_log
      WHERE tenant_id = ? AND actor_id IN (${holes})
        AND kind = ? AND created_at >= ? AND created_at <= ?
      GROUP BY actor_id`,
    scope.tenantId, ...ids, kind, ...range,
  ));
  const moves = activity("stage.changed");
  const notes = activity("note.added");
  const actions = activity("action.set");

  /* --- tasks ------------------------------------------------------------ */
  const tasksDone = byId(all<Row>(
    `SELECT done_by AS user_id, COUNT(*) n FROM tasks
      WHERE tenant_id = ? AND done_by IN (${holes})
        AND status = 'done' AND done_at >= ? AND done_at <= ?
      GROUP BY done_by`,
    scope.tenantId, ...ids, ...range,
  ));
  const tasksOverdue = byId(all<Row>(
    `SELECT assignee_id AS user_id, COUNT(*) n FROM tasks
      WHERE tenant_id = ? AND assignee_id IN (${holes})
        AND status = 'open' AND due_on IS NOT NULL AND due_on < ?
      GROUP BY assignee_id`,
    scope.tenantId, ...ids, to,
  ));

  /* --- enquiries -------------------------------------------------------- */
  const leadsOwned = byId(all<Row>(
    `SELECT owner_id AS user_id, COUNT(*) n FROM leads
      WHERE tenant_id = ? AND owner_id IN (${holes})
        AND created_at >= ? AND created_at <= ?
      GROUP BY owner_id`,
    scope.tenantId, ...ids, ...range,
  ));
  const leadsWon = byId(all<Row>(
    `SELECT owner_id AS user_id, COUNT(*) n FROM leads
      WHERE tenant_id = ? AND owner_id IN (${holes})
        AND status = 'converted' AND updated_at >= ? AND updated_at <= ?
      GROUP BY owner_id`,
    scope.tenantId, ...ids, ...range,
  ));
  /* Enquiries of theirs still sitting untouched. The expensive kind. */
  const leadsCold = byId(all<Row>(
    `SELECT owner_id AS user_id, COUNT(*) n FROM leads
      WHERE tenant_id = ? AND owner_id IN (${holes}) AND status = 'new'
      GROUP BY owner_id`,
    scope.tenantId, ...ids,
  ));

  /* --- being here ------------------------------------------------------- */
  const daysPresent = byId(all<Row>(
    `SELECT user_id, COUNT(DISTINCT day) n FROM shifts
      WHERE tenant_id = ? AND user_id IN (${holes}) AND day >= ? AND day <= ?
      GROUP BY user_id`,
    scope.tenantId, ...ids, from, to,
  ));
  /*
   * Days they used OfficeYak at all.
   *
   * Not a productivity measure and not presented as one. It answers a
   * different and narrower question: is this person's work in the system, or
   * only in their head? A counsellor doing everything by phone and notebook
   * leaves an office with nothing when they resign.
   */
  const daysActive = byId(all<Row>(
    `SELECT actor_id AS user_id, COUNT(DISTINCT substr(created_at,1,10)) n
       FROM activity_log
      WHERE tenant_id = ? AND actor_id IN (${holes})
        AND created_at >= ? AND created_at <= ?
      GROUP BY actor_id`,
    scope.tenantId, ...ids, ...range,
  ));

  const punc = new Map(punctuality(scope, from, to).map((r) => [r.user_id, r]));

  /* --- the team middle, for every dimension ----------------------------- */
  const get = (m: Map<string, number>, id: string) => m.get(id) ?? 0;
  const latePct = (id: string) => {
    const p = punc.get(id);
    return p && p.measured ? Math.round((p.late / p.measured) * 100) : 0;
  };
  const med = {
    moves: median(ids.map((i) => get(moves, i))),
    notes: median(ids.map((i) => get(notes, i))),
    actions: median(ids.map((i) => get(actions, i))),
    leadsOwned: median(ids.map((i) => get(leadsOwned, i))),
    tasksDone: median(ids.map((i) => get(tasksDone, i))),
    tasksOverdue: median(ids.map((i) => get(tasksOverdue, i))),
    leadsWon: median(ids.map((i) => get(leadsWon, i))),
    leadsCold: median(ids.map((i) => get(leadsCold, i))),
    daysPresent: median(ids.map((i) => get(daysPresent, i))),
    daysActive: median(ids.map((i) => get(daysActive, i))),
    latePct: median(ids.map(latePct)),
  };

  const analysed = people.map((p) => {
    const id = p.user_id;
    const pn = punc.get(id);
    const dimensions: Dimension[] = [
      { id: "moves", label: "Files moved on", value: get(moves, id), median: med.moves,
        goodWhen: "high", unit: "", hint: "Students they pushed into the next stage." },
      { id: "notes", label: "Notes written", value: get(notes, id), median: med.notes,
        goodWhen: "high", unit: "", hint: "What was said, on the record. A file with no notes cannot be handed over." },
      { id: "actions", label: "Next steps set", value: get(actions, id), median: med.actions,
        goodWhen: "high", unit: "", hint: "Files given a dated next action rather than left open." },
      /* Taken sits next to converted on purpose: one conversion out of two
         enquiries is a different story from one out of twenty, and an owner
         reading the second number alone would get it backwards. */
      { id: "leadsOwned", label: "Enquiries taken", value: get(leadsOwned, id), median: med.leadsOwned,
        goodWhen: "high", unit: "", hint: "Walk-ins and calls handed to them in this period." },
      { id: "leadsWon", label: "Enquiries converted", value: get(leadsWon, id), median: med.leadsWon,
        goodWhen: "high", unit: "", hint: "Of those, the ones that became students." },
      { id: "leadsCold", label: "Enquiries never rung", value: get(leadsCold, id), median: med.leadsCold,
        goodWhen: "low", unit: "", hint: "Theirs, still marked new. The most expensive thing on this page." },
      { id: "tasksDone", label: "Tasks finished", value: get(tasksDone, id), median: med.tasksDone,
        goodWhen: "high", unit: "", hint: "Jobs closed in this period." },
      { id: "tasksOverdue", label: "Tasks overdue", value: get(tasksOverdue, id), median: med.tasksOverdue,
        goodWhen: "low", unit: "", hint: "Still open, past the date they were due." },
      { id: "daysPresent", label: "Days in the office", value: get(daysPresent, id), median: med.daysPresent,
        goodWhen: "high", unit: "", hint: "Days they clocked in." },
      { id: "latePct", label: "Days arriving late", value: latePct(id), median: med.latePct,
        goodWhen: "low", unit: "%", hint: "Measured against the hour this office says it opens, with ten minutes' grace." },
      { id: "daysActive", label: "Days using OfficeYak", value: get(daysActive, id), median: med.daysActive,
        goodWhen: "high", unit: "", hint: "Days their work reached the system rather than staying in a notebook." },
    ];

    const total = dimensions.reduce((n, d) => n + d.value, 0);
    const measurable = total > 0;

    /* ---- what stands out, said plainly ---------------------------------- */
    const findings: Finding[] = [];
    const cold = get(leadsCold, id);
    const overdue = get(tasksOverdue, id);
    const filesTouched = get(moves, id) + get(notes, id);

    if (cold > 0) {
      findings.push({
        tone: cold > Math.max(2, med.leadsCold) ? "concern" : "watch",
        text: `${cold} ${cold === 1 ? "enquiry is" : "enquiries are"} still marked new and assigned to them. Nobody has rung ${cold === 1 ? "them" : "those people"} yet.`,
      });
    }
    if (overdue > 0) {
      findings.push({
        tone: overdue > Math.max(2, med.tasksOverdue) ? "concern" : "watch",
        text: `${overdue} ${overdue === 1 ? "task is" : "tasks are"} past their due date and still open.`,
      });
    }
    if (pn && pn.measured >= 5 && pn.late > pn.measured / 2) {
      findings.push({
        tone: "concern",
        text: `Arrived after ${pn.branch_name ?? "the office"} opened on ${pn.late} of ${pn.measured} days, on average ${pn.avg_late_minutes} minutes past${pn.streak >= 3 ? `, including ${pn.streak} days in a row` : ""}.`,
      });
    } else if (pn && pn.measured >= 5 && pn.late === 0) {
      findings.push({ tone: "good", text: `On time every one of ${pn.measured} days.` });
    }
    if (measurable && get(notes, id) === 0 && get(moves, id) > 0) {
      findings.push({
        tone: "concern",
        text: "Moved files forward without writing a single note. If they left tomorrow, nobody would know what was said.",
      });
    }
    if (measurable && get(daysActive, id) > 0 && get(daysPresent, id) > get(daysActive, id) * 2) {
      findings.push({
        tone: "watch",
        text: `In the office ${get(daysPresent, id)} days but only used OfficeYak on ${get(daysActive, id)}. Their work may be happening outside the system.`,
      });
    }
    if (get(leadsWon, id) > 0 && get(leadsWon, id) >= Math.max(1, med.leadsWon * 2)) {
      findings.push({
        tone: "good",
        text: `Converted ${get(leadsWon, id)} ${get(leadsWon, id) === 1 ? "enquiry" : "enquiries"}, against a team middle of ${med.leadsWon}.`,
      });
    }
    if (!measurable) {
      findings.push({
        tone: "watch",
        text: "Nothing recorded in this period. New joiner, leave, or work that is not reaching the system. Worth asking before reading anything into it.",
      });
    }

    return {
      user_id: id,
      full_name: p.full_name,
      position_label: positionOf(p.position).label,
      branch_name: p.branch_name,
      measurable,
      dimensions,
      findings,
    };
  });

  /*
   * Worst first.
   *
   * Alphabetical order put the person with three things to ask about at the
   * bottom of the list and a quiet front-desk clerk at the top, so the first
   * card an owner opened was the least useful one on the page. This is a
   * screen somebody opens with a question, and the answer should be the thing
   * it shows first.
   *
   * Ties break on name rather than on any second metric, so the order is
   * stable between visits and nobody can read a ranking into it.
   */
  return analysed.sort((a, z) => {
    const concerns = (x: PersonAnalysis) => x.findings.filter((f) => f.tone === "concern").length;
    const watches = (x: PersonAnalysis) => x.findings.filter((f) => f.tone === "watch").length;
    return concerns(z) - concerns(a)
      || watches(z) - watches(a)
      || a.full_name.localeCompare(z.full_name);
  });
}
