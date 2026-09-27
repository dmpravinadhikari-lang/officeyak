import type { Metadata } from "next";
import { ChecklistPlanner } from "./planner";
import { ToolIntro } from "../intro";
import { CountVisit } from "@/components/CountVisit";

export const metadata: Metadata = {
  // One address per page, so the same content on www or on a
  // consultancy subdomain does not compete with it in search.
  alternates: { canonical: "/tools/checklist" },
  title: "Study abroad checklist and timeline | OfficeYak",
  description:
    "Every step from choosing a course to boarding, dated backwards from your intake month so nothing is left too late.",
};

export default function PublicChecklist() {
  return (
    <>
      <CountVisit tool="checklist" />
          <div className="flex flex-col gap-6">
      <ToolIntro
        title="Everything you have to do, and when"
        sub="Tell us the country and the month your course starts. You get the whole process with real dates on it, including the ones people find out about too late, like the 28-day bank balance rule and how long an NOC actually takes."
      />
      <ChecklistPlanner />
    </div>
    </>
  );
}
