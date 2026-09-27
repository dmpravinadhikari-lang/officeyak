"use server";

import { revalidatePath } from "next/cache";
import { requireCapability } from "@/lib/auth/guard";
import { ownsStudent } from "@/lib/auth/guard";
import { addCharge, addPayment, removePayment, waiveCharge } from "./data";

/**
 * Money, so every action asks for money:manage rather than trusting that the
 * form was only rendered for the right people, and each one also checks that
 * this student belongs to this consultancy. A student id in a form field is
 * something anybody can change.
 */

const npr = (v: FormDataEntryValue | null) => {
  const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
};
const str = (v: FormDataEntryValue | null) => String(v ?? "").trim();

export async function chargeStudent(formData: FormData) {
  const { scope } = await requireCapability("money:manage");
  const studentId = str(formData.get("student_id"));
  const amount = npr(formData.get("amount_npr"));
  const label = str(formData.get("label"));
  if (!ownsStudent(scope, studentId) || !label || amount <= 0) return;

  addCharge(scope, {
    studentId, label, amountNpr: amount,
    kind: str(formData.get("kind")) || "ours",
    note: str(formData.get("note")) || null,
    branchId: scope.branchId ?? null,
  });
  revalidatePath(`/app/pipeline/${studentId}`);
  revalidatePath("/app/fees");
}

export async function payStudent(formData: FormData) {
  const { scope } = await requireCapability("money:manage");
  const studentId = str(formData.get("student_id"));
  const amount = npr(formData.get("amount_npr"));
  if (!ownsStudent(scope, studentId) || amount <= 0) return;

  addPayment(scope, {
    studentId, amountNpr: amount,
    method: str(formData.get("method")) || "cash",
    reference: str(formData.get("reference")) || null,
    paidOn: str(formData.get("paid_on")) || null,
    note: str(formData.get("note")) || null,
    branchId: scope.branchId ?? null,
  });
  revalidatePath(`/app/pipeline/${studentId}`);
  revalidatePath("/app/fees");
}

export async function toggleWaive(formData: FormData) {
  const { scope } = await requireCapability("money:manage");
  const studentId = str(formData.get("student_id"));
  if (!ownsStudent(scope, studentId)) return;
  waiveCharge(scope, str(formData.get("id")), str(formData.get("waived")) === "1");
  revalidatePath(`/app/pipeline/${studentId}`);
  revalidatePath("/app/fees");
}

export async function undoPayment(formData: FormData) {
  const { scope } = await requireCapability("money:manage");
  const studentId = str(formData.get("student_id"));
  if (!ownsStudent(scope, studentId)) return;
  removePayment(scope, str(formData.get("id")));
  revalidatePath(`/app/pipeline/${studentId}`);
  revalidatePath("/app/fees");
}
