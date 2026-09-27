import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser, scopeOf } from "@/lib/auth/current";
import { can } from "@/lib/auth/access";
import { Card, Chip, Empty, PageHeader } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { analyseTeam, type Dimension, type Finding, type PersonAnalysis } from "@/modules/staff/analysis";
import { addDays, localDay, shortDate } from "@/lib/dates";

export const metadata = { title: "Employee Analysis, OfficeYak" };

/**
 * Employee Analysis.
 *
 * The screen an owner opens before a pay review, a promotion, or a difficult
 * conversation, and the one place in OfficeYak where one person's work is laid
 * out beside their colleagues'.
 *
 * It is built to be argued with. Every number says what it counted and what
 * the rest of the team did over the same days, because a manager who cannot
 * see the comparison will invent one. Nothing is scored out of a hundred and
 * nobody is ranked into a league table: the findings name a behaviour and a
 * count, which is the most the data can honestly support and exactly what a
 * conversation needs to start from.
 *
 * A branch manager sees their own office here. An owner sees every office.
 * Neither sees a colleague's salary, which lives in payroll behind its own
 * capability, because a screen that mixes performance with pay turns every
 * review into a negotiation.
 */

const WINDOWS = [
  { id: "30", label: "Last 30 days", days: 30 },
  { id: "90", label: "Last 3 months", days: 90 },
  { id: "365", label: "Last year", days: 365 },
];

export default async function TeamPage({
  searchParams,
}: { searchParams: Promise<{ days?: string; who?: string }> }) {
  const user = await requireUser();
  // The same two capabilities that open the staff list. An owner has the
  // first, a branch manager the second, and a counsellor neither.
  if (!can(user, "hr:view") && !can(user, "branch:staff")) redirect("/app");
  const scope = scopeOf(user);

  const sp = await searchParams;
  const win = WINDOWS.find((w) => w.id === sp.days) ?? WINDOWS[0];
  const to = localDay();
  const from = addDays(to, -win.days);

  const team = analyseTeam(scope, from, to).filter((p) => p.user_id !== user.id);
  const open = sp.who && team.some((p) => p.user_id === sp.who) ? sp.who : team[0]?.user_id;
  const person = team.find((p) => p.user_id === open) ?? null;

  const q = (o: Record<string, string>) =>
    `/app/team?${new URLSearchParams({ days: win.id, ...(open ? { who: open } : {}), ...o })}`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Employee Analysis"
        sub={`How each person's work looks between ${shortDate(from)} and ${shortDate(to)}, next to the middle of the team over the same days. Numbers, not verdicts.`}
        actions={
          <div className="flex flex-wrap gap-1.5">
            {WINDOWS.map((w) => (
              <Link
                key={w.id}
                href={`/app/team?${new URLSearchParams({ days: w.id, ...(open ? { who: open } : {}) })}`}
                className={`oy-press inline-flex min-h-[36px] items-center rounded-[10px] px-3.5 text-[13px] font-semibold transition-colors ${
                  w.id === win.id
                    ? "bg-ink text-white"
                    : "border border-line-2 bg-panel text-ink-2 hover:border-brand-400 hover:text-brand-600"
                }`}
              >
                {w.label}
              </Link>
            ))}
          </div>
        }
      />

      {team.length === 0 ? (
        <Empty
          icon={<Icon name="people" size={20} />}
          title="Nobody to analyse yet"
          action={<Link href="/app/people" className="oy-press inline-flex min-h-[44px] items-center gap-2 rounded-[10px] bg-brand-500 px-5 text-[14px] font-semibold text-ink hover:bg-brand-400"><Icon name="plus" size={16} /> Add your first colleague</Link>}
        >
          Give a colleague a login and their work starts being counted here from that day.
        </Empty>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          {/* who */}
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {team.map((p) => (
              <Link
                key={p.user_id}
                href={q({ who: p.user_id })}
                className={`oy-press flex min-w-[190px] shrink-0 flex-col gap-0.5 rounded-[12px] border px-3.5 py-3 text-left transition-colors lg:min-w-0 ${
                  p.user_id === open
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-panel hover:border-brand-400"
                }`}
              >
                <span className="text-[14px] font-semibold">{p.full_name}</span>
                <span className={`text-[12px] ${p.user_id === open ? "text-white/70" : "text-muted"}`}>
                  {p.position_label}{p.branch_name ? ` · ${p.branch_name}` : ""}
                </span>
                <Flags person={p} dark={p.user_id === open} />
              </Link>
            ))}
          </nav>

          {person && (
            <div className="flex min-w-0 flex-col gap-4">
              {person.findings.length > 0 && (
                <Card className="p-5">
                  <h2 className="h-tight text-[16px]">What stands out</h2>
                  <ul className="mt-3 flex flex-col gap-2.5">
                    {person.findings.map((f, i) => <FindingRow key={i} finding={f} />)}
                  </ul>
                </Card>
              )}

              <Card className="overflow-hidden">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line bg-wash/60 px-5 py-3">
                  <h2 className="h-tight text-[15px]">{person.full_name}, measured</h2>
                  <span className="text-[12px] text-muted">
                    The grey mark is the middle of your team over the same days
                  </span>
                </div>
                <div className="grid sm:grid-cols-2">
                  {person.dimensions.map((d) => <Bar key={d.id} d={d} />)}
                </div>
              </Card>

              <p className="text-[12.5px] leading-relaxed text-muted">
                Read this next to what you already know. A quiet branch, a month of leave or a
                colleague who does their best work on the phone will all show up here as low
                numbers, and none of them means somebody is not doing their job. Use it to decide
                what to ask about, not what to conclude.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * What each row says under the name.
 *
 * It has to explain the order, or the list looks arbitrary. This showed only
 * concerns and good news, so somebody with two milder things to look at sat
 * above two colleagues with nothing under their names at all, and the sort
 * read as random. All three counts show.
 */
function Flags({ person, dark }: { person: PersonAnalysis; dark: boolean }) {
  const n = (tone: Finding["tone"]) => person.findings.filter((f) => f.tone === tone).length;
  const parts = [
    n("concern") > 0 && { text: `${n("concern")} to ask about`, cls: dark ? "text-white" : "text-danger-600" },
    n("watch") > 0 && { text: `${n("watch")} to look at`, cls: dark ? "text-white/80" : "text-gold-600" },
    n("good") > 0 && { text: `${n("good")} going well`, cls: dark ? "text-white/80" : "text-teal-600" },
  ].filter(Boolean) as Array<{ text: string; cls: string }>;
  if (!parts.length) return null;
  return (
    <span className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[11.5px]">
      {parts.map((p, i) => (
        <span key={p.text} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden className={dark ? "text-white/40" : "text-faint"}>·</span>}
          <span className={p.cls}>{p.text}</span>
        </span>
      ))}
    </span>
  );
}

function FindingRow({ finding }: { finding: Finding }) {
  const tone = finding.tone === "concern" ? "danger" : finding.tone === "good" ? "teal" : "gold";
  const icon = finding.tone === "concern" ? "alert" : finding.tone === "good" ? "check" : "clock";
  return (
    <li className="flex items-start gap-2.5">
      <span className={`mt-0.5 shrink-0 text-${tone}-600`} aria-hidden>
        <Icon name={icon as "alert"} size={16} />
      </span>
      <span className="min-w-0 text-[14px] leading-snug text-ink">{finding.text}</span>
    </li>
  );
}

/**
 * One dimension, with the team's middle marked on the same bar.
 *
 * The bar is scaled to the larger of the person and the median so the mark is
 * always visible: a bar scaled to the person alone would put the median off
 * the end exactly when the comparison matters most.
 */
function Bar({ d }: { d: Dimension }) {
  const top = Math.max(d.value, d.median, 1);
  const pct = (n: number) => Math.min(100, Math.round((n / top) * 100));
  /*
   * Red means "worth asking about", not "below average".
   *
   * Half a team is below the median by definition, so colouring on that alone
   * painted almost every bar red and the page stopped meaning anything. A bar
   * turns red only when the gap is big enough to be a real difference rather
   * than noise: a quarter off the middle, and at least one whole unit, so a
   * person on 3 against a middle of 4 is simply normal.
   */
  const gap = d.goodWhen === "high" ? d.median - d.value : d.value - d.median;
  const behind = gap >= 1 && gap >= d.median * 0.25;
  return (
    <div className="border-b border-line px-5 py-4 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13.5px] font-semibold text-ink">{d.label}</span>
        <span className="num shrink-0 text-[16px] font-semibold text-ink">
          {d.value}{d.unit}
        </span>
      </div>
      <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-wash">
        <div
          className={`h-full rounded-full ${behind ? "bg-danger-600/70" : "bg-brand-500"}`}
          style={{ width: `${pct(d.value)}%` }}
        />
        {/* the team middle */}
        <span
          aria-hidden
          className="absolute top-[-2px] h-[12px] w-[2px] rounded-full bg-ink-2"
          style={{ left: `calc(${pct(d.median)}% - 1px)` }}
        />
      </div>
      <p className="mt-1.5 text-[12px] leading-snug text-muted">
        Team middle {d.median}{d.unit}. {d.hint}
      </p>
    </div>
  );
}
