import Link from "next/link";
import { requirePermission, scopeOf } from "@/lib/auth/current";
import { Card, Chip, Empty, PageHeader, Th, type Tone } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { shortDate } from "@/lib/dates";
import { applicationSummary, SILENT_AFTER_DAYS, type LiveApplication } from "@/modules/desk/queues";
import { statusOf } from "@/modules/partners/applications";

export const metadata = { title: "Applications, OfficeYak" };

/**
 * Every application still in play.
 *
 * A visa and admissions officer's job is this list, and it did not exist. The
 * applications were all there, with institutions, intakes, statuses and
 * deadlines, and the only way to see one was to open the student whose file
 * it was on, one at a time, having first remembered which students had
 * applications out. A board that can only be read one row at a time is not a
 * board.
 *
 * Ordered by deadline rather than by student, because that is the thing that
 * cannot be moved. Two facts are called out on the row: a deadline inside a
 * fortnight, and an institution that has gone quiet for three weeks, which is
 * usually a portal asking for something nobody saw.
 *
 * Not filtered to one officer. An application is the office's commitment to a
 * family, and a deadline that passes while its owner is on leave is a lost
 * intake either way.
 */
export default async function ApplicationsPage() {
  const user = await requirePermission("applications:manage");
  const scope = scopeOf(user);
  const { rows, dueSoon, silent, offers } = applicationSummary(scope);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Applications"
        sub="Everything sent to an institution and still waiting on an answer, soonest deadline first."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Still open" value={rows.length} sub="across this office" tone="brand" />
        <Tile label="Deadline within 14 days" value={dueSoon.length} sub="cannot be moved" tone={dueSoon.length ? "danger" : "teal"} />
        <Tile label="Gone quiet" value={silent.length} sub={`no change in ${SILENT_AFTER_DAYS} days`} tone={silent.length ? "gold" : "teal"} />
        <Tile label="Offers in hand" value={offers.length} sub="waiting on the family" tone="teal" />
      </div>

      {rows.length === 0 ? (
        <Empty
          icon={<Icon name="cap" size={20} />}
          title="No applications out yet"
          action={
            <Link href="/app/pipeline" className="oy-press inline-flex min-h-[44px] items-center gap-2 rounded-[10px] bg-brand-500 px-5 text-[14px] font-semibold text-ink hover:bg-brand-400">
              <Icon name="students" size={16} /> Open the student board
            </Link>
          }
        >
          Applications are added on a student&rsquo;s own file. Once one is sent, it appears here
          until the institution answers.
        </Empty>
      ) : (
        <Card className="overflow-hidden">
          <div className="scroll-soft overflow-x-auto">
            <table className="w-full min-w-[820px] text-[13.5px]">
              <thead>
                <tr className="border-b border-line text-left">
                  {["Student", "Institution", "Intake", "Where it is", "Deadline", "Last change"].map((h) => (
                    <Th key={h}>{h}</Th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((a) => <Row key={a.id} a={a} />)}
              </tbody>
            </table>
          </div>
          <p className="border-t border-line px-5 py-3 text-[12.5px] leading-relaxed text-muted">
            Click a student to open their file, where an application&rsquo;s status is changed and
            the offer letter is kept. A deadline shown in red has already passed, and an intake
            missed is a year, not a fortnight.
          </p>
        </Card>
      )}
    </div>
  );
}

function Row({ a }: { a: LiveApplication }) {
  const s = statusOf(a.status);
  const late = a.daysLeft !== null && a.daysLeft < 0;
  const soon = a.daysLeft !== null && a.daysLeft >= 0 && a.daysLeft <= 14;
  const quiet = a.status === "submitted" && a.quiet >= SILENT_AFTER_DAYS;
  return (
    <tr>
      <td className="px-4 py-2.5">
        <Link href={`/app/pipeline/${a.student_id}`} className="font-semibold text-ink hover:text-brand-600">
          {a.student_name}
        </Link>
      </td>
      <td className="px-4 py-2.5">
        <span className="block text-ink-2">{a.institution}</span>
        {a.course && <span className="block text-[12.5px] text-muted">{a.course}</span>}
      </td>
      <td className="px-4 py-2.5 text-muted">{a.intake ?? "Not set"}</td>
      <td className="px-4 py-2.5">
        <Chip tone={s.tone as Tone}>{s.label}</Chip>
      </td>
      <td className="num px-4 py-2.5">
        {a.deadline === null ? (
          <span className="text-muted">Not set</span>
        ) : (
          <span className={late ? "font-semibold text-danger-600" : soon ? "font-semibold text-gold-600" : "text-ink-2"}>
            {shortDate(a.deadline.slice(0, 10))}
            {late && <span className="block text-[12px]">passed</span>}
            {soon && <span className="block text-[12px]">{a.daysLeft === 0 ? "today" : `in ${a.daysLeft} days`}</span>}
          </span>
        )}
      </td>
      <td className="num px-4 py-2.5">
        {quiet ? (
          <Chip tone="gold">Silent {a.quiet} days</Chip>
        ) : (
          <span className="text-muted">{a.quiet === 0 ? "Today" : `${a.quiet} days ago`}</span>
        )}
      </td>
    </tr>
  );
}

function Tile({ label, value, sub, tone }: { label: string; value: number; sub: string; tone: Tone }) {
  const ink = tone === "danger" ? "text-danger-600" : tone === "gold" ? "text-gold-600" : tone === "teal" ? "text-teal-700" : "text-ink";
  return (
    <div className="rounded-2xl border border-line bg-panel px-4 py-3.5">
      <div className="text-[12px] leading-snug text-muted">{label}</div>
      <div className={`num mt-1 text-[26px] font-semibold leading-none ${ink}`}>{value}</div>
      <div className="mt-1 text-[12px] text-muted">{sub}</div>
    </div>
  );
}
