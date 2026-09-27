import type { Metadata } from "next";
import { DocChecklist } from "./tool";
import { ToolIntro } from "../intro";
import { CountVisit } from "@/components/CountVisit";

export const metadata: Metadata = {
  // One address per page, so the same content on www or on a
  // consultancy subdomain does not compete with it in search.
  alternates: { canonical: "/tools/document-checklist" },
  title: "Document checklist for studying abroad | OfficeYak",
  description:
    "The papers each destination asks a Nepali student for, in the words your bank and consultancy use. Free, no account.",
};

export default function DocumentChecklistPage() {
  return (
    <>
      <CountVisit tool="document-checklist" />
          <div className="flex flex-col gap-6">
      <ToolIntro
        title="Every paper you will be asked for"
        sub="Filtered by where you are going and how far along you are, because a list of everything is a list nobody reads. The ones that take weeks to obtain are marked."
      />
      <DocChecklist />
    </div>
    </>
  );
}
