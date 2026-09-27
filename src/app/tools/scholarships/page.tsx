import type { Metadata } from "next";
import { ScholarshipFinder } from "@/app/app/scholarships/finder";
import { ToolIntro } from "../intro";
import { CountVisit } from "@/components/CountVisit";

export const metadata: Metadata = {
  // One address per page, so the same content on www or on a
  // consultancy subdomain does not compete with it in search.
  alternates: { canonical: "/tools/scholarships" },
  title: "Scholarships for Nepali students studying abroad | OfficeYak",
  description:
    "Scholarships Nepali students can actually apply for, with the value, the deadline and who is eligible. Free to search.",
};

export default function PublicScholarships() {
  return (
    <>
      <CountVisit tool="scholarships" />
          <div className="flex flex-col gap-6">
      <ToolIntro
        title="Funding a Nepali student can actually get"
        sub="Most of the big scholarships close eight to twelve months before the intake, and most want work experience. Better to know that now than in June."
      />
      <ScholarshipFinder initialCountry="" initialLevel="masters" hasWorkExperience />
    </div>
    </>
  );
}
