import { all, now, run, uid } from "@/lib/db";
import type { Scope } from "@/lib/db/scope";

/**
 * Bringing an existing consultancy's students in from a spreadsheet.
 *
 * Every consultancy that signs up already has its students somewhere: a
 * shared Excel file, a Google Sheet one counsellor maintains, an export from
 * whatever they used before. Asking them to retype four hundred families is
 * asking them not to switch, and it is the single largest thing standing
 * between an interested owner and a working office.
 *
 * Three rules, all of which come from the same belief that a bad import is
 * worse than no import.
 *
 * Nothing is written until the office has seen what will happen. The upload
 * produces a plan: this many new, this many already here, these rows I cannot
 * read and why. Only then is there a button.
 *
 * Column names are guessed, not demanded. A sheet that says "Student Name",
 * "student_name", "Name" or "नाम" all mean the same thing, and a person who
 * has to rename columns to match a specification will give up and ring
 * somebody instead.
 *
 * A row that cannot be read is reported, never dropped quietly. The failure
 * mode that destroys trust is importing three hundred and eighty of four
 * hundred students and saying "done".
 */

export type ImportKind = "students" | "leads";

/* Header spellings seen in the wild, lowercased and stripped of punctuation. */
const ALIASES: Record<string, string[]> = {
  full_name: ["full name", "name", "student name", "student", "studentname", "fullname", "candidate name"],
  email: ["email", "email address", "e mail", "mail", "student email"],
  phone: ["phone", "mobile", "contact", "phone number", "mobile number", "contact number", "number"],
  destination: ["destination", "country", "going to", "preferred country", "target country"],
  course: ["course", "programme", "program", "subject", "intended course"],
  intake: ["intake", "session", "term", "start", "intake month"],
  stage: ["stage", "status", "pipeline stage", "current stage"],
  counsellor: ["counsellor", "counselor", "assigned to", "owner", "handled by", "advisor"],
  source: ["source", "how did they hear", "lead source", "came from", "referral source"],
  note: ["note", "notes", "remark", "remarks", "comment", "comments"],
};

const normalise = (h: string) =>
  h.toLowerCase().replace(/[_\-.]+/g, " ").replace(/[^a-zऀ-ॿ ]+/g, "").replace(/\s+/g, " ").trim();

/** Which of our fields a spreadsheet column is, or null if we cannot tell. */
export function matchColumn(header: string): string | null {
  const h = normalise(header);
  if (!h) return null;
  for (const [field, names] of Object.entries(ALIASES)) {
    if (names.includes(h)) return field;
  }
  // "Student's Full Name" contains "full name"; try a contains pass second so
  // an exact match always wins over a loose one.
  for (const [field, names] of Object.entries(ALIASES)) {
    if (names.some((n) => n.length > 4 && h.includes(n))) return field;
  }
  return null;
}

/**
 * A CSV parser that handles the things real exports contain: quoted fields,
 * commas and newlines inside quotes, doubled quotes, and the BOM Excel writes
 * at the front of a UTF-8 file.
 */
export function parseCsv(text: string): string[][] {
  const s = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"') {
        if (s[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
      } else cell += c;
      continue;
    }
    if (c === '"') { quoted = true; continue; }
    if (c === ",") { row.push(cell); cell = ""; continue; }
    if (c === "\r") continue;
    if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; continue; }
    cell += c;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

export type PlannedRow = {
  line: number;
  values: Record<string, string>;
  verdict: "new" | "duplicate" | "skipped";
  reason?: string;
};

export type Plan = {
  kind: ImportKind;
  headers: string[];
  mapped: Record<number, string>;
  unmapped: string[];
  rows: PlannedRow[];
  counts: { new: number; duplicate: number; skipped: number };
};

/**
 * Read the file and say what would happen. Writes nothing.
 *
 * A student is "already here" when the email matches, or when the phone
 * matches and no email was given. Phone is how a Nepali consultancy actually
 * identifies a family, and plenty of students have no email until the office
 * makes them one.
 */
export function planImport(scope: Scope, kind: ImportKind, csv: string): Plan {
  const table = parseCsv(csv);
  if (table.length === 0) {
    return { kind, headers: [], mapped: {}, unmapped: [], rows: [], counts: { new: 0, duplicate: 0, skipped: 0 } };
  }

  const headers = table[0].map((h) => h.trim());
  const mapped: Record<number, string> = {};
  const unmapped: string[] = [];
  headers.forEach((h, i) => {
    const field = matchColumn(h);
    if (field && !Object.values(mapped).includes(field)) mapped[i] = field;
    else if (h) unmapped.push(h);
  });

  const existing = all<{ email: string | null; phone: string | null }>(
    kind === "students"
      ? "SELECT email, phone FROM users WHERE tenant_id = ? AND role = 'student'"
      : "SELECT email, phone FROM leads WHERE tenant_id = ?",
    scope.tenantId,
  );
  const emails = new Set(existing.map((e) => (e.email ?? "").toLowerCase()).filter(Boolean));
  const phones = new Set(existing.map((e) => digits(e.phone)).filter(Boolean));
  const seenEmail = new Set<string>();
  const seenPhone = new Set<string>();

  const rows: PlannedRow[] = [];
  for (let r = 1; r < table.length; r++) {
    const values: Record<string, string> = {};
    for (const [idx, field] of Object.entries(mapped)) {
      values[field] = (table[r][Number(idx)] ?? "").trim();
    }

    const name = values.full_name ?? "";
    const email = (values.email ?? "").toLowerCase();
    const phone = digits(values.phone);

    if (!name) {
      rows.push({ line: r + 1, values, verdict: "skipped", reason: "No name in this row" });
      continue;
    }
    /*
     * A phone number is required, not preferred. The leads table demands one
     * and so does the work: a Nepali consultancy rings families, and a row
     * nobody can ring is not a lead, it is a name. Reported rather than
     * dropped, so the office can go and find the numbers.
     */
    if (!phone) {
      rows.push({ line: r + 1, values, verdict: "skipped", reason: "No phone number, and nobody could be rung" });
      continue;
    }
    if ((email && emails.has(email)) || (!email && phone && phones.has(phone))) {
      rows.push({ line: r + 1, values, verdict: "duplicate", reason: "Already in OfficeYak" });
      continue;
    }
    if ((email && seenEmail.has(email)) || (!email && phone && seenPhone.has(phone))) {
      rows.push({ line: r + 1, values, verdict: "duplicate", reason: "Appears twice in this file" });
      continue;
    }
    if (email) seenEmail.add(email);
    if (phone) seenPhone.add(phone);
    rows.push({ line: r + 1, values, verdict: "new" });
  }

  return {
    kind, headers, mapped, unmapped, rows,
    counts: {
      new: rows.filter((r) => r.verdict === "new").length,
      duplicate: rows.filter((r) => r.verdict === "duplicate").length,
      skipped: rows.filter((r) => r.verdict === "skipped").length,
    },
  };
}

/** Nepali numbers are written with spaces, dashes and sometimes +977. */
const digits = (v: string | null | undefined) => {
  const d = String(v ?? "").replace(/\D/g, "");
  return d.length >= 9 ? d.slice(-10) : "";
};

/**
 * Write the rows the plan called new. Nothing else.
 *
 * Students arrive as leads rather than as user accounts, whichever kind was
 * chosen. An imported row is somebody the office knows about, not somebody
 * who has agreed to a login, and creating four hundred dormant accounts with
 * unusable passwords would be four hundred invitations nobody sent. Staff
 * convert a lead to a student when the family actually signs up, which is the
 * same path a walk-in takes.
 */
export function runImport(scope: Scope, plan: Plan): { created: number } {
  let created = 0;
  const t = now();

  for (const row of plan.rows) {
    if (row.verdict !== "new") continue;
    const v = row.values;
    const note = [v.course && `Course: ${v.course}`, v.intake && `Intake: ${v.intake}`,
      v.stage && `Was at stage: ${v.stage}`, v.counsellor && `Was with: ${v.counsellor}`, v.note]
      .filter(Boolean).join(". ");

    run(
      `INSERT INTO leads (id, tenant_id, branch_id, full_name, phone, email, destination, intake, source, status, note, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      uid(), scope.tenantId, scope.branchId ?? null,
      v.full_name, v.phone, v.email || null,
      v.destination || null, v.intake || null,
      // Kept as the source so an office can always find what came from the
      // old system, months later, without guessing from the date.
      v.source ? `Imported: ${v.source}` : "Imported",
      "new", note || null, t, t,
    );
    created++;
  }
  return { created };
}
