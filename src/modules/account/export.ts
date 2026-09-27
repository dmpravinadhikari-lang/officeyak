import { all } from "@/lib/db";
import type { Scope } from "@/lib/db/scope";

/**
 * Everything a consultancy has put into OfficeYak, on demand.
 *
 * The pricing page has promised "export of your own data, ask us and we send
 * it" since it was written, which is a promise that depends on somebody being
 * available and willing. A customer who is leaving is exactly the customer
 * least likely to get a quick answer, and that is precisely when the promise
 * matters. So it is a button.
 *
 * Two principles decide what goes in it.
 *
 * It is their data, not a report about their data. Every row of every table
 * that carries their tenant id, with real column names, so it can be loaded
 * into a spreadsheet or another system rather than read like a summary.
 *
 * It does not include anybody else's. Password hashes are dropped, because an
 * export sitting in a downloads folder should not be a credential database.
 * Session tokens, reset tokens and API tokens are dropped for the same
 * reason. What is left is what they typed in and what the product recorded
 * about it.
 *
 * Document files themselves are not in here. They are encrypted on disk, they
 * are large, and a zip of two hundred passport scans is a very different
 * object from a spreadsheet of names. The export lists every document with
 * its kind, its student and its dates, and says how to ask for the files.
 */

/**
 * Tables exported in full for the tenant, in an order a human would read: who
 * you are, then the students, then the work, then the money, then the office.
 */
const TABLES = [
  "branches", "teams", "team_members", "users", "user_permissions",
  "leads", "pipeline_entries", "pipeline_notes", "student_profiles",
  "applications", "partners", "commissions",
  "student_charges", "student_payments",
  "classes", "class_enrolments", "class_attendance",
  "documents", "document_checks", "checklist_items", "parent_links",
  "tasks", "alerts", "attendance", "shifts", "holidays",
  "leave_requests", "leave_balances", "employees", "employee_experience",
  "payroll_people", "payroll_runs", "payroll_lines",
  "sop_documents", "sop_versions", "interview_sessions",
  "test_attempts", "test_bookings",
  "tenant_automations", "automation_runs",
  "notifications", "activity_log", "audit_log", "usage_events",
] as const;

/** Columns never exported, whichever table they appear on. */
const SECRET = new Set([
  "password_hash", "pin_hash", "token_hash", "google_sub",
  "secret", "api_key", "access_code",
]);

/** Tables reached through the student rather than by a tenant column. */
const VIA_STUDENT = new Set(["team_members", "payroll_lines"]);

type Row = Record<string, unknown>;

function rowsFor(scope: Scope, table: string): Row[] {
  try {
    if (table === "team_members") {
      return all<Row>(
        `SELECT tm.* FROM team_members tm JOIN teams t ON t.id = tm.team_id WHERE t.tenant_id = ?`,
        scope.tenantId,
      );
    }
    if (table === "payroll_lines") {
      return all<Row>(
        `SELECT pl.* FROM payroll_lines pl JOIN payroll_runs pr ON pr.id = pl.run_id WHERE pr.tenant_id = ?`,
        scope.tenantId,
      );
    }
    return all<Row>(`SELECT * FROM ${table} WHERE tenant_id = ?`, scope.tenantId);
  } catch {
    // A table named here that does not exist in this database yet should not
    // take the whole export down with it.
    return [];
  }
}

const strip = (rows: Row[]): Row[] =>
  rows.map((r) => {
    const out: Row = {};
    for (const [k, v] of Object.entries(r)) if (!SECRET.has(k)) out[k] = v;
    return out;
  });

/** RFC 4180: quote everything, double the quotes inside. Excel and Sheets both read it. */
function toCsv(rows: Row[]): string {
  if (rows.length === 0) return "";
  const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const cell = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [cols.map(cell).join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\r\n");
}

export type ExportFile = { name: string; body: string };

export function buildExport(scope: Scope, tenantName: string): ExportFile[] {
  const files: ExportFile[] = [];
  const counts: { table: string; rows: number }[] = [];

  for (const table of TABLES) {
    const rows = strip(rowsFor(scope, table));
    counts.push({ table, rows: rows.length });
    if (rows.length > 0) files.push({ name: `${table}.csv`, body: toCsv(rows) });
  }

  const today = new Date().toISOString().slice(0, 10);
  files.unshift({
    name: "READ ME.txt",
    body: [
      `${tenantName}: everything held in OfficeYak`,
      `Exported ${today}`,
      "",
      "One CSV per kind of record. Open them in Excel, Google Sheets or",
      "LibreOffice, or load them into another system. Column names are the",
      "real ones, and ids match across files: a row in applications.csv points",
      "at a student in users.csv by that student's id.",
      "",
      "What is deliberately not here:",
      "",
      "  Passwords. Nobody's password is in this file, in any form. If you are",
      "  moving to another system your staff set new ones there.",
      "",
      "  The document files themselves. Passports, bank statements and offer",
      "  letters are encrypted on disk and are far too large to sit in a",
      "  spreadsheet. documents.csv lists every one of them with its kind, the",
      "  student it belongs to and its dates. Ask us and we will send the files",
      "  separately.",
      "",
      "  Other consultancies' data. This export contains only rows belonging to",
      "  your own consultancy.",
      "",
      "What is in it:",
      "",
      ...counts.filter((c) => c.rows > 0).map((c) => `  ${String(c.rows).padStart(6)}  ${c.table}`),
      "",
      counts.every((c) => c.rows === 0)
        ? "  Nothing yet. This account has no records."
        : `  ${counts.reduce((t, c) => t + c.rows, 0)} rows in total.`,
      "",
      "This file was produced by the consultancy's own account. Keep it",
      "somewhere safe: it holds names, phone numbers and financial details for",
      "every family you work with.",
    ].join("\n"),
  });

  return files;
}
