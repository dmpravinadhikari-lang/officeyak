import { requireScope } from "@/lib/auth/current";
import { CvBuilder } from "@/modules/cv/ui/CvBuilder";

/** The CV maker, inside the product. See app/eligibility for why. */
export const metadata = { title: "CV Maker, OfficeYak" };

export default async function AppCvMakerPage() {
  await requireScope();
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="display text-[28px]">CV Maker</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-2">
          A CV laid out the way admissions offices abroad expect to read it, rather than the way a
          Nepali job application is usually written.
        </p>
      </header>
      <CvBuilder />
    </div>
  );
}
