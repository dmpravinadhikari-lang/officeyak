import { redirect } from "next/navigation";
import { requireScope } from "@/lib/auth/current";
import { Card, Chip, PageHeader } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { myFile } from "@/modules/students/my-file";
import { npr } from "@/lib/terms";
import { shortDate } from "@/lib/dates";

export const metadata = { title: "My application, OfficeYak" };

/**
 * My application.
 *
 * A parent opening their progress link is shown the stage, what happens next,
 * the money and a button to ring the counsellor. The student, whose
 * application it is, had none of that anywhere in the product: eighteen
 * practice tools, and no answer to "what is actually happening with my file".
 * They were asking their counsellor by phone, which is the call this whole
 * product exists to save.
 *
 * So this is the parent page, for the person it is about, plus the two things
 * a parent has no business seeing and a student does: their class timetable
 * and their own attendance.
 *
 * What is not here is the counsellor's file notes. A note is a colleague
 * writing to a colleague, and one written knowing the student will read it
 * stops being worth writing.
 */
export default async function MyFilePage() {
  const { user, scope } = await requireScope();
  // Staff have the board, the ledger and the register. This page exists
  // because a student has none of those, so it is theirs alone.
  if (user.role !== "student") redirect("/app");

  const f = myFile(scope);
  const phone = f.counsellor?.phone ?? f.office?.phone ?? null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My application"
        sub={`Where ${f.consultancy || "your consultancy"} has got to, what it costs, and when your classes are. Updated by them, not by you.`}
      />

      {/* ------------------------------------------------- where you are */}
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Right now</div>
            {f.stage ? (
              <>
                <h2 className="display mt-1.5 text-[26px] leading-tight">{f.stage.label}</h2>
                <p className="mt-1 max-w-lg text-[14px] leading-relaxed text-ink-2">{f.stage.blurb}</p>
              </>
            ) : (
              <>
                <h2 className="display mt-1.5 text-[22px] leading-tight">Not on the board yet</h2>
                <p className="mt-1 max-w-lg text-[14px] leading-relaxed text-ink-2">
                  Your consultancy has not opened a file for you yet. Everything you do in the
                  practice tools is saved and waiting for when they do.
                </p>
              </>
            )}
          </div>
          {f.office && <Chip tone="grey">{f.office.name}</Chip>}
        </div>

        {f.nextAction && (
          <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 p-4">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-brand-700">
              What happens next
            </div>
            <p className="mt-1 text-[15px] leading-snug text-ink">{f.nextAction.text}</p>
            {f.nextAction.due && (
              <p className="mt-1 text-[13px] text-muted">By {shortDate(f.nextAction.due.slice(0, 10))}</p>
            )}
          </div>
        )}
      </Card>

      {/* ------------------------------------------------------ classes */}
      {f.classes.length > 0 && (
        <Card className="overflow-hidden">
          <div className="border-b border-line bg-wash/60 px-5 py-3">
            <h2 className="h-tight text-[15px]">Your classes</h2>
          </div>
          <ul className="divide-y divide-line">
            {f.classes.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <div className="text-[14.5px] font-semibold text-ink">{c.class_name}</div>
                  <div className="text-[13px] text-muted">{c.when || "Times not set yet"}</div>
                </div>
                {/*
                  Their own attendance, and only their own. A student comparing
                  themselves with the rest of the batch is a different product.
                */}
                {c.rate === null
                  ? <Chip tone="grey">No register yet</Chip>
                  : <Chip tone={c.rate >= 80 ? "teal" : c.rate >= 60 ? "gold" : "danger"}>
                      You have been in {c.rate}% of classes
                    </Chip>}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* -------------------------------------------------------- money */}
      {f.money && (
        <Card className="overflow-hidden">
          <div className="border-b border-line bg-wash/60 px-5 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="h-tight text-[15px]">What you owe</h2>
              {f.money.lastPaidOn && (
                <span className="text-[12.5px] text-muted">
                  Last payment {shortDate(f.money.lastPaidOn.slice(0, 10))}
                </span>
              )}
            </div>
          </div>
          <div className="grid gap-px bg-line sm:grid-cols-3">
            {[
              { label: "Charged", value: f.money.billed, tone: "text-ink" },
              { label: "Paid", value: f.money.paid, tone: "text-teal-700" },
              { label: "Still to pay", value: f.money.balance, tone: f.money.balance > 0 ? "text-danger-600" : "text-teal-700" },
            ].map((x) => (
              <div key={x.label} className="bg-panel px-5 py-4">
                <div className="text-[12.5px] text-muted">{x.label}</div>
                <div className={`num mt-1 text-[22px] font-semibold ${x.tone}`}>{npr(x.value)}</div>
              </div>
            ))}
          </div>
          <p className="border-t border-line px-5 py-3 text-[12.5px] leading-relaxed text-muted">
            {/*
              The split matters to a family deciding whether a bill is fair.
              A consultancy passing on a test fee at cost is doing something
              different from charging for its own work, and lumping the two
              together is how a perfectly honest invoice starts an argument.
            */}
            {npr(f.money.ours)} is {f.consultancy || "your consultancy"}'s own charge.
            {f.money.passedThrough > 0 && ` ${npr(f.money.passedThrough)} is fees they pay on to somebody else, such as a test centre or an embassy.`}
            {" "}If a figure here looks wrong, ask them before you pay it.
          </p>
        </Card>
      )}

      {/* ------------------------------------------------------- who to ask */}
      <Card className="p-5">
        <h2 className="h-tight text-[15px]">Who is looking after you</h2>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">
          {f.counsellor
            ? `${f.counsellor.name}, at ${f.office?.name ?? f.consultancy}.`
            : `Nobody at ${f.consultancy || "your consultancy"} is named on your file yet. Ring the office and ask who your counsellor is.`}
        </p>
        {(phone || f.office?.email) && (
          <div className="mt-3.5 flex flex-wrap gap-2">
            {phone && (
              <a
                href={`tel:${phone.replace(/[^+\d]/g, "")}`}
                className="oy-press inline-flex min-h-[44px] items-center gap-2 rounded-[10px] bg-ink px-4 text-[14px] font-semibold text-white transition-colors hover:bg-ink-2"
              >
                <Icon name="phone" size={16} /> Call {phone}
              </a>
            )}
            {f.office?.email && (
              <a
                href={`mailto:${f.office.email}`}
                className="oy-press inline-flex min-h-[44px] items-center gap-2 rounded-[10px] border border-line-2 bg-panel px-4 text-[14px] font-semibold text-ink transition-colors hover:border-brand-400 hover:text-brand-600"
              >
                <Icon name="inbox" size={16} /> Email the office
              </a>
            )}
          </div>
        )}
      </Card>

      <p className="text-[12.5px] leading-relaxed text-muted">
        Everything on this page is written by your consultancy. If your stage or a figure is out of
        date, it is because they have not updated it yet, and asking them is the fastest fix.
      </p>
    </div>
  );
}
