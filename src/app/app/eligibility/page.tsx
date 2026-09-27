import { requireScope } from "@/lib/auth/current";
import { EligibilityTool } from "@/app/tools/eligibility/tool";

/**
 * The eligibility check, inside the product.
 *
 * This tool, the loan calculator, the CV maker and the destination compare
 * all existed only at /tools, which is the public marketing site. So a signed
 * in student who tapped "Eligibility Check" on their own dashboard was thrown
 * out of the app onto a page with no rail, no bottom bar and no way back
 * except a "My dashboard" button in the top corner. Four of the thirteen
 * things on a student's home screen ejected them from the product.
 *
 * The public pages stay exactly as they are, because they are how somebody
 * with no account finds OfficeYak at all. The same component is simply
 * mounted here too, so a person who is signed in keeps their navigation.
 */
export const metadata = { title: "Eligibility Check, OfficeYak" };

export default async function AppEligibilityPage() {
  await requireScope();
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="display text-[28px]">Eligibility Check</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-2">
          Whether you can get in, and whether you can get the visa. Two different questions, and
          this answers both plainly, including when the answer is no.
        </p>
      </header>
      <EligibilityTool />
    </div>
  );
}
