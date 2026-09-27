import type { Metadata } from "next";
import { LoanTool } from "./tool";
import { ToolIntro } from "../intro";
import { CountVisit } from "@/components/CountVisit";

export const metadata: Metadata = {
  // One address per page, so the same content on www or on a
  // consultancy subdomain does not compete with it in search.
  alternates: { canonical: "/tools/loan" },
  title: "Education loan EMI calculator for Nepal | OfficeYak",
  description:
    "What an education loan really costs: monthly EMI, total interest, and the figure over the whole term. Free, in Nepali rupees.",
};

export default function LoanPage() {
  return (
    <>
      <CountVisit tool="loan" />
          <div className="flex flex-col gap-6">
      <ToolIntro
        title="What the loan actually costs to pay back"
        sub="Generic EMI calculators get student loans wrong because they ignore the moratorium. The years you are studying, when you are not repaying principal but interest is still running. That single choice changes the total by lakhs."
      />
      <LoanTool />
    </div>
    </>
  );
}
