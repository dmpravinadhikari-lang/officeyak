import { requireScope } from "@/lib/auth/current";
import { LoanTool } from "@/app/tools/loan/tool";

/** The loan calculator, inside the product. See app/eligibility for why. */
export const metadata = { title: "Education Loan EMI, OfficeYak" };

export default async function AppLoanPage() {
  await requireScope();
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="display text-[28px]">Education Loan EMI</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-2">
          What a Nepali education loan really costs, including the interest that builds up while
          you are still studying and not yet earning.
        </p>
      </header>
      <LoanTool />
    </div>
  );
}
