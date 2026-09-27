"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireRole, scopeOf } from "@/lib/auth/current";
import { requireCapability } from "@/lib/auth/guard";
import { can } from "@/lib/auth/access";
import { hashPassword } from "@/lib/auth/password";
import { all, now, one, run, uid } from "@/lib/db";
import { isPosition, positionOf } from "@/lib/auth/positions";

export type StaffState = { ok: boolean; message?: string; password?: string };

const clean = (v: FormDataEntryValue | null) => String(v ?? "").trim();

function tempPassword(): string {
  const words = ["himal", "chautari", "sagar", "gurans", "makalu", "bagmati", "pokhara", "annapurna"];
  return `${words[randomBytes(1)[0] % words.length]}-${randomBytes(2).toString("hex")}`;
}

/**
 * Gives a new member of staff their own login.
 *
 * Only a consultancy admin can do this, and only inside their own
 * consultancy. The password is shown once to the admin who created it, the
 * same way a student's is, so it can be handed over in person.
 */
export async function addStaffMember(_prev: StaffState, formData: FormData): Promise<StaffState> {
  /*
   * A branch manager may do this, for their own office.
   *
   * The permission table has always said so: "branch:staff, add and remove
   * counsellor accounts" is one of the grants on the branch manager position,
   * and the access screen shows it to them ticked. This action asked for the
   * tenant_admin role instead, so the product promised something it then
   * refused, and every new counsellor in every office had to go through the
   * owner. In a consultancy with four branches that is the owner doing HR
   * admin for people they have never met.
   *
   * The capability decides who may add somebody. The scope decides where:
   * an owner sees all offices and picks one, a branch manager does not get
   * that choice, because a manager who can create an account in another
   * manager's office can read that office's students through it.
   */
  const { user, scope } = await requireCapability("branch:staff");

  const fullName = clean(formData.get("full_name"));
  const email = clean(formData.get("email")).toLowerCase();
  const phone = clean(formData.get("phone"));
  /*
   * The job decides the role underneath, rather than the other way round.
   *
   * A managing director is the consultancy's own admin; everybody else is
   * staff, and what they may actually touch comes from their position. So the
   * form asks one human question, and the two system words are derived.
   */
  const requested = isPosition(clean(formData.get("position"))) ? clean(formData.get("position")) : "counsellor";
  /*
   * Nobody creates somebody senior to themselves.
   *
   * Only a person who can already change what colleagues may do is allowed to
   * mint an owner or another branch manager. Without this, a branch manager
   * could create an "owner" account and sign in as the consultancy.
   */
  const mayPromote = can(user, "people:permissions");
  const position = !mayPromote && (requested === "owner" || requested === "branch_manager")
    ? "counsellor"
    : requested;
  const role = position === "owner" ? "tenant_admin" : "counsellor";
  /*
   * Where the new person lands.
   *
   * Whoever may see every office chooses. Anybody else gets their own office,
   * whatever the form said, so a tampered form cannot place somebody in a
   * branch the person creating them cannot see.
   */
  const branchId = scope.see === "all"
    ? clean(formData.get("branch_id")) || null
    : scope.branchId ?? null;

  if (fullName.length < 2) return { ok: false, message: "Enter their full name." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, message: "That email address does not look right." };
  if (one("SELECT 1 FROM users WHERE email = ?", email)) {
    return { ok: false, message: "Someone already has an account with that email." };
  }
  if (branchId && !one("SELECT 1 FROM branches WHERE id = ? AND tenant_id = ?", branchId, scope.tenantId)) {
    return { ok: false, message: "Choose one of your own offices." };
  }

  const password = tempPassword();
  const id = uid();
  run(
    `INSERT INTO users (id, tenant_id, email, password_hash, full_name, phone, role, position, student_plan, email_verified, active, created_at)
     VALUES (?,?,?,?,?,?,?,?, NULL, 0, 1, ?)`,
    id, scope.tenantId, email, hashPassword(password), fullName, phone || null, role, position, now(),
  );
  run("UPDATE users SET branch_id = ? WHERE id = ?", branchId, id);

  revalidatePath("/app/people");
  return {
    ok: true,
    message: `${fullName} can log in with ${email} as ${positionOf(position).label.toLowerCase()}, using this password.`,
    password,
  };
}

/** A team is a desk work can be given to, such as "Visa desk". */
export async function addTeam(formData: FormData) {
  const user = await requireRole("super_admin", "tenant_admin");
  const scope = scopeOf(user);

  const name = clean(formData.get("name"));
  const branchId = clean(formData.get("branch_id")) || null;
  if (name.length < 2) return;
  if (branchId && !one("SELECT 1 FROM branches WHERE id = ? AND tenant_id = ?", branchId, scope.tenantId)) return;

  const teamId = uid();
  run(
    "INSERT INTO teams (id, tenant_id, branch_id, name, created_at) VALUES (?,?,?,?,?)",
    teamId, scope.tenantId, branchId, name, now(),
  );

  // Members are ticked on the same form, so a team is never created empty.
  const allowed = new Set(
    all<{ id: string }>(
      "SELECT id FROM users WHERE tenant_id = ? AND role <> 'student' AND active = 1", scope.tenantId,
    ).map((r) => r.id),
  );
  for (const memberId of formData.getAll("member_id").map(String)) {
    if (!allowed.has(memberId)) continue;
    run("INSERT OR IGNORE INTO team_members (team_id, user_id, joined_at) VALUES (?,?,?)", teamId, memberId, now());
  }

  revalidatePath("/app/people");
  revalidatePath("/app/tasks");
}
