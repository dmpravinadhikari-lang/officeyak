"use server";

import { revalidatePath } from "next/cache";
import { requireCapability } from "@/lib/auth/guard";
import { logActivity } from "@/lib/crm/activity";
import { planImport, runImport, type ImportKind, type Plan } from "@/modules/account/import";

/**
 * Two steps on purpose. The first reads the file and returns a plan; the
 * second writes it. Nothing reaches the database until somebody has looked at
 * what would happen and pressed a second button.
 */

export type PlanState = { plan?: Plan; error?: string; done?: number };

export async function previewImport(_prev: PlanState, formData: FormData): Promise<PlanState> {
  const { scope } = await requireCapability("consultancy:admin");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a CSV file first." };
  if (file.size > 8_000_000) return { error: "That file is larger than 8MB. Split it and bring it in two halves." };

  const text = await file.text();
  const kind = (String(formData.get("kind") ?? "leads") as ImportKind);
  const plan = planImport(scope, kind, text);

  if (plan.rows.length === 0) return { error: "No rows found. Is the first line the column headings?" };
  if (!Object.values(plan.mapped).includes("full_name")) {
    return { error: `No column looks like a name. The headings found were: ${plan.headers.join(", ")}` };
  }
  return { plan };
}

export async function commitImport(_prev: PlanState, formData: FormData): Promise<PlanState> {
  const { user, scope } = await requireCapability("consultancy:admin");
  const raw = String(formData.get("plan") ?? "");
  if (!raw) return { error: "The preview expired. Upload the file again." };

  let plan: Plan;
  try { plan = JSON.parse(raw) as Plan; } catch { return { error: "The preview could not be read. Upload the file again." }; }

  const { created } = runImport(scope, plan);
  logActivity(scope, {
    actorId: user.id, actorLabel: user.fullName, kind: "data.imported",
    summary: `${user.fullName} imported ${created} ${created === 1 ? "record" : "records"} from a spreadsheet`,
    detail: { skipped: plan.counts.skipped, duplicates: plan.counts.duplicate },
  });
  revalidatePath("/app/leads");
  revalidatePath("/app/data");
  return { done: created };
}
