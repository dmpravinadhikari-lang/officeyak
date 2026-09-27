import Link from "next/link";
import { requireCapability } from "@/lib/auth/guard";
import { all } from "@/lib/db";
import { Card, Chip, Empty, Field, PageHeader, inputClass, type Tone } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { localDay, shortDate } from "@/lib/dates";
import {
  classesFor, timetableFor, daysLabel, SUBJECTS, CLASS_STATUSES, WEEKDAYS,
} from "@/modules/classes/data";
import { saveClass } from "@/modules/classes/actions";

export const metadata = { title: "Classes, OfficeYak" };

/**
 * The timetable, and the batches behind it.
 *
 * Today comes first because that is the question an instructor and a front
 * desk actually have at eight in the morning. Everything else is the list of
 * batches that produced it.
 */
export default async function ClassesPage() {
  const { scope } = await requireCapability("tests:manage");
  const today = localDay();
  const classes = classesFor(scope);
  const todays = timetableFor(scope, today);

  const teachers = all<{ id: string; full_name: string }>(
    "SELECT id, full_name FROM users WHERE tenant_id = ? AND role IN ('tenant_admin','counsellor') AND active = 1 ORDER BY full_name",
    scope.tenantId,
  );

  const tone = (s: string) => (CLASS_STATUSES.find((x) => x.id === s)?.tone ?? "grey") as Tone;
  const time = (c: { start_time: string | null; end_time: string | null }) =>
    c.start_time ? `${c.start_time}${c.end_time ? ` to ${c.end_time}` : ""}` : "No time set";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Classes"
        sub="Test preparation batches, who teaches them, and who is in the room."
      />

      {/* ---------------------------------------------------------- today */}
      <section>
        <h2 className="h-tight text-[17px]">
          Today, {shortDate(today)}
        </h2>
        {todays.length === 0 ? (
          <Card className="mt-3 p-5">
            <p className="text-[13.5px] text-ink-2">
              Nothing meets today. Either it is the day off, or no batch is running yet.
            </p>
          </Card>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {todays.map((c) => (
              <Link
                key={c.id} href={`/app/classes/${c.id}`}
                className="group flex flex-col gap-2 rounded-2xl border border-line bg-panel p-5 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-brand-400"
              >
                <div className="mono text-[20px] font-medium leading-none text-ink">{c.start_time ?? "--:--"}</div>
                <div className="h-[3px] w-9 rounded-full bg-brand-500" />
                <div className="text-[15px] font-semibold text-ink group-hover:text-brand-600">{c.name}</div>
                <div className="text-[12.5px] text-muted">
                  {c.teacher_name ?? "No teacher set"}
                  {c.room ? ` · ${c.room}` : ""}
                </div>
                <div className="mt-auto pt-1 text-[12.5px] font-semibold text-brand-600">
                  {c.enrolled ?? 0} enrolled · take the register →
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* -------------------------------------------------------- every batch */}
      <section>
        <h2 className="h-tight text-[17px]">Every batch</h2>
        {classes.length === 0 ? (
          <Empty icon={<Icon name="cap" size={22} />} title="No classes yet">
            A batch is a name, a teacher, a time and the days it meets. Start one below and enrol
            students into it from their own file or from the batch.
          </Empty>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {classes.map((c) => (
              <Link
                key={c.id} href={`/app/classes/${c.id}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-line bg-panel px-5 py-3.5 hover:border-brand-400"
              >
                <span className="min-w-[180px] flex-1">
                  <span className="block text-[14.5px] font-semibold text-ink">{c.name}</span>
                  <span className="block text-[12.5px] text-muted">
                    {SUBJECTS.find((s) => s.id === c.subject)?.label ?? c.subject} · {daysLabel(c.days)} · {time(c)}
                  </span>
                </span>
                <span className="text-[13px] text-ink-2">{c.teacher_name ?? "No teacher"}</span>
                <span className="mono text-[13px] text-ink-2">
                  {c.enrolled ?? 0}{c.capacity ? ` / ${c.capacity}` : ""}
                </span>
                <Chip tone={tone(c.status)}>{CLASS_STATUSES.find((s) => s.id === c.status)?.label}</Chip>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* --------------------------------------------------------- new batch */}
      <Card className="p-5">
        <h2 className="h-tight text-[16px]">Start a batch</h2>
        <p className="mt-1 text-[12.5px] text-muted">
          Saturday is off by default, since the working week here runs Sunday to Friday.
        </p>
        <form action={saveClass} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Name" name="cls_name">
            <input id="cls_name" name="name" required className={inputClass} placeholder="IELTS morning" />
          </Field>
          <Field label="Subject" name="cls_subject">
            <select id="cls_subject" name="subject" defaultValue="ielts" className={inputClass}>
              {SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Teacher" name="cls_teacher">
            <select id="cls_teacher" name="teacher_id" defaultValue="" className={inputClass}>
              <option value="">Not set yet</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </select>
          </Field>
          <Field label="Starts" name="cls_start"><input id="cls_start" type="date" name="starts_on" className={inputClass} /></Field>
          <Field label="Ends" name="cls_end"><input id="cls_end" type="date" name="ends_on" className={inputClass} /></Field>
          <Field label="Room" name="cls_room"><input id="cls_room" name="room" className={inputClass} placeholder="Room 2" /></Field>
          <Field label="From" name="cls_from"><input id="cls_from" type="time" name="start_time" className={inputClass} /></Field>
          <Field label="To" name="cls_to"><input id="cls_to" type="time" name="end_time" className={inputClass} /></Field>
          <Field label="Seats" name="cls_cap"><input id="cls_cap" name="capacity" inputMode="numeric" className={inputClass} placeholder="25" /></Field>

          <fieldset className="sm:col-span-2 lg:col-span-3">
            <legend className="text-[12px] font-medium text-muted">Which days</legend>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {WEEKDAYS.map((d) => (
                <label key={d.n} className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-full border border-line-2 px-3.5 text-[13px] has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50 has-[:checked]:font-semibold has-[:checked]:text-brand-700">
                  <input type="checkbox" name="days" value={d.n} defaultChecked={d.n <= 4} className="h-4 w-4 accent-[#FF7A1A]" />
                  {d.short}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="sm:col-span-2 lg:col-span-3">
            <button type="submit" className="inline-flex min-h-[44px] items-center gap-2 rounded-[10px] bg-ink px-5 text-[14px] font-semibold text-white hover:bg-ink-2">
              <Icon name="plus" size={16} /> Start the batch
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
