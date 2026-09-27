import { requireScope } from "@/lib/auth/current";
import { CompareTool } from "@/app/tools/compare/tool";

/** Destination compare, inside the product. See app/eligibility for why. */
export const metadata = { title: "Compare Destinations, OfficeYak" };

export default async function AppComparePage() {
  await requireScope();
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="display text-[28px]">Compare Destinations</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-2">
          Two countries side by side on cost, visa, work rights and the funds you must be able to
          show.
        </p>
      </header>
      <CompareTool />
    </div>
  );
}
