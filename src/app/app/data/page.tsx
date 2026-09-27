import { requireCapability } from "@/lib/auth/guard";
import { scalar } from "@/lib/db";
import { Card, PageHeader } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { ImportForm } from "./import-form";

export const metadata = { title: "Your data, OfficeYak" };

/**
 * Getting data in, and getting it out again.
 *
 * Both halves are here for the same reason. An office will not move four
 * hundred families into a system by retyping them, and it should not have to
 * ask permission to leave with what it typed. A product that is easy to leave
 * is easier to join, and the promise on the pricing page said "ask us and we
 * send it", which depends on somebody being available exactly when they are
 * least likely to be.
 */
export default async function DataPage() {
  const { scope } = await requireCapability("branch:settings");

  const students = scalar("SELECT COUNT(*) FROM users WHERE tenant_id = ? AND role = 'student'", scope.tenantId);
  const leads = scalar("SELECT COUNT(*) FROM leads WHERE tenant_id = ?", scope.tenantId);
  const docs = scalar("SELECT COUNT(*) FROM documents WHERE tenant_id = ?", scope.tenantId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Your data"
        sub="Bring your old records in, and take everything out again whenever you want."
      />

      {/* ------------------------------------------------------------ out */}
      <Card className="p-5">
        <h2 className="h-tight text-[16px]">Download everything</h2>
        <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink-2">
          One zip file, one spreadsheet per kind of record: your {leads.toLocaleString("en-IN")} enquiries,
          {" "}{students.toLocaleString("en-IN")} students, their applications, fees, classes, attendance,
          staff and payroll. Real column names, so it opens in Excel or loads into another system.
        </p>

        <ul className="mt-3 flex flex-col gap-1.5 text-[13px] text-ink-2">
          {[
            "No passwords are included, in any form.",
            `The ${docs.toLocaleString("en-IN")} uploaded documents are listed but the files themselves are not: they are encrypted and far too large for a spreadsheet. Ask us and we send them separately.`,
            "It holds every family's name, phone number and financial details. Keep it somewhere safe.",
          ].map((line) => (
            <li key={line} className="flex gap-2">
              <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              {line}
            </li>
          ))}
        </ul>

        <a
          href="/api/account/export" download
          className="oy-press mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-[10px] bg-ink px-5 text-[14px] font-semibold text-white hover:bg-ink-2"
        >
          <Icon name="folder" size={16} /> Download my data
        </a>
        <p className="mt-2 text-[12px] text-muted">
          Every download is recorded in the activity log, with who asked for it and when.
        </p>
      </Card>

      {/* ------------------------------------------------------------- in */}
      <section>
        <h2 className="h-tight text-[17px]">Bring your old records in</h2>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-ink-2">
          Whatever you were using before, a spreadsheet, a Google Sheet, an export from another
          system, it comes in here. Nothing is written until you have seen exactly what will happen.
        </p>
        <div className="mt-3">
          <ImportForm />
        </div>
      </section>
    </div>
  );
}
