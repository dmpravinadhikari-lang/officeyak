import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/guard";
import { all } from "@/lib/db";
import { Card, Chip, PageHeader, inputClass, type Tone } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { Kpi } from "@/components/brand-ui";
import { localDay, shortDate } from "@/lib/dates";
import {
  classById, registerFor, rosterFor, attendanceRate, meetsOn, daysLabel,
  SUBJECTS, CLASS_STATUSES,
} from "@/modules/classes/data";
import { markRegister, enrolStudent, changeEnrolment } from "@/modules/classes/actions";
import { SubmitButton } from "@/components/ui-motion";

/**
 * One batch: who is in it, how often they come, and the register for a day.
 *
 * The register defaults to today, and to the last day the class actually met
 * if today is the day off. An instructor opening this on a Saturday wants
 * Friday's list, not an empty page.
 */
export default async function ClassPage({
  params, searchParams,
}: {
  params: Promise<{ classId: string }>;
  searchParams: Promise<{ on?: string }>;
}) {
  const { scope } = await requireCapability("tests:manage");
  const { classId } = await params;
  const { on } = await searchParams;

  const cls = classById(scope, classId);
  if (!cls) notFound();

  /* Today, unless the class does not meet today: then the most recent day it did. */
  let day = on || localDay();
  if (!on && !meetsOn(cls, day)) {
    for (let i = 1; i <= 7; i++) {
      const d = new Date(`${localDay()}T12:00:00Z`);
      d.setUTCDate(d.getUTCDate() - i);
      const candidate = d.toISOString().slice(0, 10);
      if (meetsOn(cls, candidate)) { day = candidate; break; }
    }
  }

  const register = registerFor(scope, classId, day);
  const roster = rosterFor(scope, classId);
  const marked = register.filter((r) => r.present !== null).length;
  const presentToday = register.filter((r) => r.present === true).length;

  /* Students at this consultancy who are not already in this batch. */
  const enrolledIds = new Set(roster.map((r) => r.student_id));
  const addable = all<{ id: string; full_name: string }>(
    "SELECT id, full_name FROM users WHERE tenant_id = ? AND role = 'student' AND active = 1 ORDER BY full_name",
    scope.tenantId,
  ).filter((s) => !enrolledIds.has(s.id));

  const tone = (s: string) => (CLASS_STATUSES.find((x) => x.id === s)?.tone ?? "grey") as Tone;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={cls.name}
        sub={`${SUBJECTS.find((s) => s.id === cls.subject)?.label ?? cls.subject} · ${daysLabel(cls.days)}${cls.start_time ? ` · ${cls.start_time}` : ""}${cls.teacher_name ? ` · ${cls.teacher_name}` : ""}`}
        actions={<Chip tone={tone(cls.status)}>{CLASS_STATUSES.find((s) => s.id === cls.status)?.label}</Chip>}
      />

      <Card className="p-5">
        <div className="grid gap-6 sm:grid-cols-3">
          <Kpi peak="grow" value={roster.filter((r) => r.status === "active").length} label="On the roll"
            sub={cls.capacity ? `of ${cls.capacity} seats` : "no seat limit set"} />
          <Kpi peak="prepare" value={marked === 0 ? "Not taken" : `${presentToday} / ${register.length}`}
            label={`Register for ${shortDate(day)}`}
            sub={marked === 0 ? "nobody has marked it yet" : `${register.length - presentToday} absent`} />
          <Kpi peak="run" value={cls.room ?? "Not set"} label="Room"
            sub={cls.starts_on ? `from ${shortDate(cls.starts_on)}` : "no start date"} />
        </div>
      </Card>

      {/* ------------------------------------------------------- the register */}
      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="h-tight text-[17px]">Register</h2>
          <form className="flex items-center gap-2">
            <label htmlFor="on" className="text-[12.5px] text-muted">Day</label>
            <input id="on" type="date" name="on" defaultValue={day}
              className="min-h-[36px] rounded-lg border border-line-2 px-2 text-[13px]" />
            <button type="submit" className="oy-press rounded-[10px] border border-line-2 px-3 py-1.5 text-[12.5px] font-semibold text-ink-2 hover:border-brand-400 hover:text-brand-600">
              Show
            </button>
          </form>
        </div>

        {!meetsOn(cls, day) && (
          <p className="mt-2 text-[13px] text-muted">
            This batch does not normally meet on {shortDate(day)}. You can still mark a register if
            it ran as an extra session.
          </p>
        )}

        {register.length === 0 ? (
          <Card className="mt-3 p-5">
            <p className="text-[13.5px] text-ink-2">Nobody is enrolled yet. Add students below.</p>
          </Card>
        ) : (
          <form action={markRegister}>
            <input type="hidden" name="class_id" value={cls.id} />
            <input type="hidden" name="on_date" value={day} />
            <Card className="mt-3 divide-y divide-line">
              {register.map((r) => {
                const rate = attendanceRate(scope, r.student_id, cls.id);
                return (
                  <label key={r.student_id} className="flex cursor-pointer flex-wrap items-center gap-3 px-5 py-3">
                    <input type="hidden" name="student_ids" value={r.student_id} />
                    <input
                      type="checkbox" name={`present_${r.student_id}`} value="1"
                      defaultChecked={r.present !== false}
                      className="h-5 w-5 shrink-0 accent-[#FF7A1A]"
                    />
                    <span className="min-w-0 flex-1 text-[14px] font-medium text-ink">{r.student_name}</span>
                    {rate.pct !== null && (
                      <span className={`mono text-[12.5px] ${rate.pct < 70 ? "font-semibold text-danger-600" : "text-muted"}`}>
                        {rate.pct}% over {rate.total}
                      </span>
                    )}
                    {r.present === null && <Chip tone="grey">Not marked</Chip>}
                  </label>
                );
              })}
              <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                <SubmitButton size="lg" pendingLabel="Saving" doneLabel="Register saved">
                  <Icon name="check" size={16} /> Save the register
                </SubmitButton>
                <span className="text-[12.5px] text-muted">
                  Ticked is present. Everyone is ticked by default, so you only untick who is missing.
                </span>
              </div>
            </Card>
          </form>
        )}
      </section>

      {/* ------------------------------------------------------------ roster */}
      <section>
        <h2 className="h-tight text-[17px]">Who is in this batch</h2>
        <Card className="mt-3 divide-y divide-line">
          {roster.length === 0 && <p className="px-5 py-4 text-[13.5px] text-muted">Nobody yet.</p>}
          {roster.map((e) => {
            const rate = attendanceRate(scope, e.student_id, cls.id);
            return (
              <div key={e.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <Link href={`/app/pipeline/${e.student_id}`} className="min-w-0 flex-1 text-[14px] font-medium text-ink hover:text-brand-600">
                  {e.student_name}
                </Link>
                <span className="mono text-[12.5px] text-muted">
                  {rate.total === 0 ? "no sessions yet" : `${rate.present} of ${rate.total} attended`}
                </span>
                {e.status !== "active" && <Chip tone="grey">{e.status === "left" ? "Left" : "Completed"}</Chip>}
                <form action={changeEnrolment}>
                  <input type="hidden" name="class_id" value={cls.id} />
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="status" value={e.status === "active" ? "left" : "active"} />
                  <button type="submit" className="px-2 text-[12px] font-medium text-muted hover:text-brand-600">
                    {e.status === "active" ? "Mark as left" : "Bring back"}
                  </button>
                </form>
              </div>
            );
          })}

          {addable.length > 0 && (
            <form action={enrolStudent} className="flex flex-wrap items-end gap-2 px-5 py-4">
              <input type="hidden" name="class_id" value={cls.id} />
              <label htmlFor="add_student" className="sr-only">Student to enrol</label>
              <select id="add_student" name="student_id" className={`${inputClass} max-w-[280px]`} defaultValue="">
                <option value="">Choose a student</option>
                {addable.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
              <SubmitButton variant="secondary" pendingLabel="Enrolling" doneLabel="Enrolled">
                <Icon name="plus" size={15} /> Enrol
              </SubmitButton>
            </form>
          )}
        </Card>
      </section>

      <Link href="/app/classes" className="text-[13.5px] font-semibold text-brand-600 hover:underline">
        ← All classes
      </Link>
    </div>
  );
}
