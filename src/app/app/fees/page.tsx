import Link from "next/link";
import { requireCapability } from "@/lib/auth/guard";
import { Card, Empty, PageHeader, ScrollHint, Th } from "@/components/ui";
import { Kpi, NavyCard } from "@/components/brand-ui";
import { Icon } from "@/components/Icon";
import { feeSummary } from "@/modules/fees/data";
import { shortDate } from "@/lib/dates";

export const metadata = { title: "Student fees, OfficeYak" };

/**
 * What students owe the office, across everyone.
 *
 * Commission is the money that arrives next year. This is the money that
 * pays this month's rent, and it was the half of the accounts the product
 * could not see at all.
 *
 * The list is ordered by how long a balance has been outstanding rather than
 * by how large it is. A big new balance is usually a family who paid their
 * deposit last week. A small old one is a conversation nobody has had, and
 * those are the ones that turn into arguments.
 */
export default async function FeesPage() {
  await requireCapability("money:view");
  const { scope } = await requireCapability("money:view");

  const s = feeSummary(scope);
  const npr = (n: number) => `NPR ${n.toLocaleString("en-IN")}`;
  const daysSince = (iso: string | null) =>
    iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 864e5) : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Student fees"
        sub="What students have been charged, what they have paid, and who has owed it longest."
      />

      <NavyCard decoration="ridge">
        <div className="grid gap-8 sm:grid-cols-3">
          <Kpi
            tone="dark" peak="grow" size={32}
            value={npr(s.outstanding)}
            label="Outstanding"
            sub={s.owing.length === 0 ? "everyone is settled" : `${s.owing.length} ${s.owing.length === 1 ? "student" : "students"} owe something`}
          />
          <Kpi
            tone="dark" peak="prepare" size={32}
            value={npr(s.paid)}
            label="Collected"
            sub={`${s.collectedPct}% of everything billed`}
          />
          <Kpi
            tone="dark" peak="run" size={32}
            value={npr(s.billed)}
            label="Billed"
            sub="fees and pass-through charges together"
          />
        </div>
      </NavyCard>

      <section>
        <h2 className="h-tight text-[17px]">
          {s.owing.length === 0 ? "Nobody owes anything" : "Who owes, longest first"}
        </h2>
        <p className="mt-1 max-w-3xl text-[13.5px] leading-relaxed text-ink-2">
          Ordered by how long the balance has been outstanding, not by size. An old small balance is
          a conversation nobody has had; a large new one is usually a family who paid their deposit
          last week.
        </p>

        {s.owing.length === 0 ? (
          <Empty icon={<Icon name="wallet" size={22} />} title="Nothing outstanding">
            Charges appear here once you add them to a student&apos;s file. Open any student, go to
            the fees section, and record what they have been quoted.
          </Empty>
        ) : (
          <Card className="mt-3 overflow-hidden">
            <div className="scroll-soft overflow-x-auto">
              <table className="w-full min-w-[720px] text-[13.5px]">
                <thead>
                  <tr className="border-b border-line bg-wash text-left">
                    {["Student", "Billed", "Paid", "Outstanding", "Owed for", "Last payment"].map((h) => (
                      <Th key={h}>{h}</Th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {s.owing.map((o) => {
                    const age = daysSince(o.oldest_unpaid);
                    return (
                      <tr key={o.student_id}>
                        <td className="px-4 py-3">
                          <Link href={`/app/pipeline/${o.student_id}`} className="font-semibold text-ink hover:text-brand-600">
                            {o.student_name}
                          </Link>
                          {o.branch_name && <span className="block text-[12px] text-muted">{o.branch_name}</span>}
                        </td>
                        <td className="mono px-4 py-3 text-ink-2">{npr(o.billed)}</td>
                        <td className="mono px-4 py-3 text-ink-2">{npr(o.paid)}</td>
                        <td className="mono px-4 py-3 font-semibold text-ink">{npr(o.balance)}</td>
                        <td className="px-4 py-3">
                          {age === null ? (
                            <span className="text-muted">·</span>
                          ) : (
                            <span className={age > 60 ? "font-semibold text-danger-600" : "text-ink-2"}>
                              {age} {age === 1 ? "day" : "days"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-ink-2">
                          {o.last_paid_on ? shortDate(o.last_paid_on) : <span className="text-muted">never</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ScrollHint>Swipe the table sideways to see when they last paid</ScrollHint>
          </Card>
        )}
      </section>

      <p className="max-w-3xl text-[12.5px] leading-relaxed text-muted">
        A government charge passed through at cost and a fee for this office&apos;s own work are
        recorded separately, and a statement shows them apart. A family that discovers a line they
        believed was a government fee was a service fee will describe it as overcharging, and the
        arithmetic being right will not help.
      </p>
    </div>
  );
}
