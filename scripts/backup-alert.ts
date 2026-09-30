/**
 * Tells somebody when the backup stops working.
 *
 *   node scripts/backup-alert.ts             the daily check
 *   node scripts/backup-alert.ts --failed    from systemd, when the job failed
 *
 * The backup was made trustworthy and then left unwatched, which is half a
 * job. It runs at 21:45, encrypts, copies to Google Drive and verifies the
 * copy, and if any of that stops working the only trace is a red unit on a
 * machine nobody logs into. A backup nobody is watching is a backup that has
 * already stopped, you just do not know which night it happened.
 *
 * Two alarms, because there are two ways to lose backups and only one of them
 * is an error:
 *
 *   --failed   systemd ran the job and the job failed. Loud, immediate, and
 *              carries the last of the journal so the reason is in the email
 *              rather than behind an ssh session.
 *
 *   the check  nothing failed and nothing happened either. A disabled timer,
 *              a machine that was off at 21:45, a unit somebody masked during
 *              an incident and forgot. This is the one that would otherwise
 *              go unnoticed for months, so it is the one worth a daily job.
 *
 * It sends over SMTP directly rather than through the product's mail queue.
 * The queue lives in the database and drains on a schedule, so using it would
 * mean an alert about broken infrastructure travelling through infrastructure
 * that may be equally broken.
 */
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { activeEmailProvider } from "../src/lib/email/provider.ts";

try { process.loadEnvFile?.(".env.local"); } catch { /* the server passes them in */ }

const BACKUP_DIR = process.env.OFFICEYAK_BACKUP_DIR || "./data/backups";
const RECEIPT = join(BACKUP_DIR, ".last-offsite");
const REMOTE = process.env.OFFICEYAK_BACKUP_REMOTE || "(not configured)";

/**
 * How many days of silence before this is a problem.
 *
 * Two, not one. The job runs nightly, so one missed night is a machine that
 * was rebooting at 21:45 and will catch up tonight by itself. Two nights is
 * something that is not going to fix itself, and an alarm that cries on the
 * first night is an alarm people learn to delete unread.
 */
const STALE_AFTER_DAYS = 2;

const to = (process.env.OFFICEYAK_ALERT_EMAIL || "").trim();

function lastJournal(): string {
  try {
    return execFileSync("journalctl", ["-u", "officeyak-backup", "-n", "25", "--no-pager"], {
      encoding: "utf8", timeout: 10_000,
    }).trim();
  } catch {
    return "(could not read the journal on this machine)";
  }
}

function ageInDays(path: string): number | null {
  if (!existsSync(path)) return null;
  return Math.floor((Date.now() - statSync(path).mtimeMs) / 864e5);
}

async function send(subject: string, body: string) {
  if (!to) {
    console.error("!! OFFICEYAK_ALERT_EMAIL is not set, so there is nobody to tell.");
    console.error(`!! The alert would have been: ${subject}`);
    process.exit(1);
  }
  const provider = activeEmailProvider();
  const r = await provider.send({ to, subject, body });
  console.log(r.ok ? `Alert sent to ${to}: ${subject}` : `!! Could not send the alert: ${r.detail}`);
  if (!r.ok) process.exit(1);
}

const failed = process.argv.includes("--failed");
const age = ageInDays(RECEIPT);
const lastGood = age === null
  ? "There is no record of a backup ever reaching the remote."
  : `The last backup to reach ${REMOTE} was ${age === 0 ? "today" : age === 1 ? "yesterday" : `${age} days ago`}.`;

if (failed) {
  await send(
    "OfficeYak backup FAILED last night",
    [
      "The nightly backup job did not finish.",
      "",
      lastGood,
      "",
      "Nothing is lost yet: the previous backups are still where they were, on the",
      "server and in Google Drive. But tonight's is missing, and until this is",
      "fixed every night adds to the gap.",
      "",
      "The last of the log:",
      "",
      lastJournal(),
      "",
      "To look yourself:  journalctl -u officeyak-backup -n 50",
      "To run it now:     systemctl start officeyak-backup",
    ].join("\n"),
  );
} else if (age === null || age > STALE_AFTER_DAYS) {
  await send(
    "OfficeYak backups have quietly stopped",
    [
      "Nothing has failed. Nothing has run either, which is worse, because a",
      "failure would have told you.",
      "",
      lastGood,
      `Anything longer than ${STALE_AFTER_DAYS} days means the nightly job is not running at all:`,
      "a disabled timer, a masked unit, or a machine that was off.",
      "",
      "To check:   systemctl list-timers officeyak-backup.timer",
      "To run it:  systemctl start officeyak-backup",
    ].join("\n"),
  );
} else {
  console.log(`Backups are current. ${lastGood}`);
}
