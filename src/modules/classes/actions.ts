"use server";

import { revalidatePath } from "next/cache";
import { requireCapability, ownsStudent } from "@/lib/auth/guard";
import { createClass, updateClass, enrol, setEnrolmentStatus, mark } from "./data";

/**
 * Running a class is tests:manage, which the managing director, the branch
 * manager and the instructor have. Marking a register is the same
 * permission: the person at the front of the room is the only one who knows
 * who came.
 */

const str = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const int = (v: FormDataEntryValue | null) => {
  const n = Number(String(v ?? "").replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
};

export async function saveClass(formData: FormData) {
  const { scope } = await requireCapability("tests:manage");
  const name = str(formData.get("name"));
  if (name.length < 2) return;

  const days = formData.getAll("days").map(String).filter(Boolean).join(",");
  const patch = {
    name,
    subject: str(formData.get("subject")) || "ielts",
    teacher_id: str(formData.get("teacher_id")) || null,
    starts_on: str(formData.get("starts_on")) || null,
    ends_on: str(formData.get("ends_on")) || null,
    days: days || "0,1,2,3,4",
    start_time: str(formData.get("start_time")) || null,
    end_time: str(formData.get("end_time")) || null,
    room: str(formData.get("room")) || null,
    capacity: int(formData.get("capacity")),
    status: str(formData.get("status")) || "running",
  };

  const id = str(formData.get("id"));
  if (id) updateClass(scope, id, patch);
  else createClass(scope, patch);

  revalidatePath("/app/classes");
  if (id) revalidatePath(`/app/classes/${id}`);
}

export async function enrolStudent(formData: FormData) {
  const { scope } = await requireCapability("tests:manage");
  const classId = str(formData.get("class_id"));
  const studentId = str(formData.get("student_id"));
  if (!classId || !ownsStudent(scope, studentId)) return;
  enrol(scope, classId, studentId);
  revalidatePath(`/app/classes/${classId}`);
}

export async function changeEnrolment(formData: FormData) {
  const { scope } = await requireCapability("tests:manage");
  setEnrolmentStatus(scope, str(formData.get("id")), str(formData.get("status")));
  revalidatePath(`/app/classes/${str(formData.get("class_id"))}`);
}

/**
 * The whole register in one submit.
 *
 * Marked as a single form rather than a button per student because an
 * instructor with twenty five students should press once, not twenty five
 * times, and a half saved register is worse than none.
 */
export async function markRegister(formData: FormData) {
  const { scope } = await requireCapability("tests:manage");
  const classId = str(formData.get("class_id"));
  const day = str(formData.get("on_date"));
  if (!classId || !day) return;

  for (const id of formData.getAll("student_ids").map(String)) {
    // An unticked checkbox sends nothing, which is exactly how a register
    // works: present is the exception you record, absent is the default.
    mark(scope, { classId, studentId: id, day, present: formData.get(`present_${id}`) === "1" });
  }
  revalidatePath(`/app/classes/${classId}`);
}
