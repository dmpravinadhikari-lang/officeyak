import "server-only";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * What the scheduled SEO agent leaves behind, and what the Marketing tab reads.
 *
 * The agent runs in the cloud and cannot reach this server's database, and
 * giving it credentials that could would mean putting a production secret
 * inside a cloud agent. So it writes JSON into the repository instead, commits
 * it, and the deploy that carries the guide it wrote carries the report with
 * it. The file is the interface between the two halves.
 *
 * This is the same arrangement `src/modules/market/data.ts` already uses for
 * market intelligence, for the same reason: content that changes on a schedule
 * and is written by something other than a person belongs in a file that can
 * be read, diffed and reverted, not in a table nobody can inspect.
 *
 * Everything here is optional on purpose. A run that could not reach Search
 * Console still produces a report; it simply has no `search` block, and the
 * tab says so rather than drawing an empty chart. A missing field always means
 * "this was not measured", never "this was zero".
 */

const DIR = join(process.cwd(), "content", "seo");

export type Severity = "critical" | "warning" | "note";

/** One thing found on one page. `fixed` means the agent already fixed it. */
export type Finding = {
  url: string;
  kind: string;
  detail: string;
  severity: Severity;
  fixed: boolean;
};

/** Something the agent was not allowed to do, and why it is worth doing. */
export type Suggestion = {
  title: string;
  detail: string;
  /** Why it matters, in the agent's own words. */
  why?: string;
  severity: Severity;
  /** Set when it needs a person: a credential, a decision, a fact. */
  needsYou?: string;
};

export type Published = {
  url: string;
  title: string;
  keyword: string;
  words?: number;
  kind?: "guide" | "landing";
};

export type CompetitorMove = {
  name: string;
  /** Empty means checked and they published nothing, which is itself a fact. */
  newPages: { title: string; url: string }[];
};

/**
 * Search Console figures, when the credential exists. Absent means it does
 * not, and the tab must say that rather than render zeroes.
 */
export type SearchData = {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  /** Previous period, for the comparison. */
  previous?: { clicks: number; impressions: number };
  /** The queries worth acting on: already close, not yet arrived. */
  nearlyRanking?: { query: string; page: string; position: number; impressions: number }[];
  /** Shown, and not chosen. Usually a title problem. */
  poorCtr?: { query: string; page: string; impressions: number; ctr: number }[];
};

/**
 * Whether the page published yesterday has been indexed. Absent means the
 * check was not run, which is not the same as "not indexed" and must not be
 * drawn as one.
 */
export type Indexing = {
  url: string;
  indexed: boolean;
  /** How old the page is. A day is normal; a week is a signal. */
  ageDays?: number;
  /** When Google chose a different canonical, the one it chose. */
  googleCanonical?: string;
  /** The agent's reading of why, when it is not indexed and old enough to matter. */
  note?: string;
};

export type Report = {
  /** ISO. When the run finished. */
  runAt: string;
  kind: "daily" | "weekly" | "monthly";
  site: {
    up: boolean;
    status?: number;
    sitemapUrls?: number;
    /** Set when the agent could not reach the site at all, which is not an
     *  outage and must never be reported as one. */
    unreachable?: string;
  };
  audit?: { pagesChecked: number; findings: Finding[] };
  published?: Published;
  /** Yesterday's page, and whether Google has it yet. */
  indexing?: Indexing;
  competitors?: CompetitorMove[];
  search?: SearchData;
  suggestions?: Suggestion[];
  /** Named capabilities the run had to skip, and what each one needs. */
  skipped?: { what: string; needs: string }[];
  /** The agent's own summary. Four lines on a normal day. */
  summary?: string;
};

const read = (file: string): Report | null => {
  try {
    const raw = readFileSync(join(DIR, file), "utf8");
    // A truncated write is worse than a missing file, because it renders as a
    // confident empty report. Treat anything unparseable as absent.
    return raw.trim() ? (JSON.parse(raw) as Report) : null;
  } catch {
    return null;
  }
};

/** The most recent run of any kind, or null before the first one. */
export function latestReport(): Report | null {
  return read("latest.json");
}

/**
 * Dated runs, newest first. The agent writes one per run into history/ so a
 * month of them can be read back without a database.
 */
export function reportHistory(limit = 30): Report[] {
  const dir = join(DIR, "history");
  if (!existsSync(dir)) return [];
  let files: string[];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  return files
    .sort()
    .reverse()
    .slice(0, limit)
    .map((f) => read(join("history", f)))
    .filter((r): r is Report => r !== null);
}

/** Everything still open across the most recent runs, worst first. */
export function openSuggestions(reports: Report[]): Suggestion[] {
  const order: Record<Severity, number> = { critical: 0, warning: 1, note: 2 };
  const seen = new Set<string>();
  const out: Suggestion[] = [];
  for (const r of reports) {
    for (const s of r.suggestions ?? []) {
      if (seen.has(s.title)) continue;
      seen.add(s.title);
      out.push(s);
    }
  }
  return out.sort((a, b) => order[a.severity] - order[b.severity]);
}

/** How many days in a row a run finished and the site was up. */
export function healthyStreak(reports: Report[]): number {
  let n = 0;
  for (const r of reports) {
    if (!r.site.up) break;
    n++;
  }
  return n;
}
