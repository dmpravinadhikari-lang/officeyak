import type { Metadata } from "next";
import { EligibilityTool } from "./tool";
import { ToolIntro } from "../intro";
import { CountVisit } from "@/components/CountVisit";

export const metadata: Metadata = {
  // One address per page, so the same content on www or on a
  // consultancy subdomain does not compete with it in search.
  alternates: { canonical: "/tools/eligibility" },
  title: "Am I eligible to study abroad? Free check | OfficeYak",
  description:
    "Check your grades, English score and funds against what each destination actually asks for. Free, no account, written for Nepali students.",
};

export default function EligibilityPage() {
  return (
    <>
      <CountVisit tool="eligibility" />
          <div className="flex flex-col gap-6">
      <ToolIntro
        title="Can you actually get in, and get the visa?"
        sub="Two different questions, and most students only think about the first. This checks both against what each destination really requires, and tells you plainly if the answer is no."
      />
      <EligibilityTool />
    </div>
    </>
  );
}
