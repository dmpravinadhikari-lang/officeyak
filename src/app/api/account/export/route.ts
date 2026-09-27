import { requireCapability } from "@/lib/auth/guard";
import { one } from "@/lib/db";
import { buildExport } from "@/modules/account/export";
import { logActivity } from "@/lib/crm/activity";
import { zip } from "@/lib/zip";

/**
 * Download everything this consultancy has in OfficeYak.
 *
 * A route rather than a server action because the answer is a file, and
 * because a plain link that downloads is the thing a non-technical owner
 * expects a download button to be.
 *
 * Requires branch:settings: this is the whole consultancy's data including
 * salaries and every family's phone number, so it belongs to whoever runs the
 * place and not to whoever is logged in. The download is written to the
 * activity log, because an export of every student's details leaving the
 * building is exactly the kind of event somebody should be able to look up
 * afterwards.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const { user, scope } = await requireCapability("branch:settings");

  const tenant = one<{ name: string; slug: string }>(
    "SELECT name, slug FROM tenants WHERE id = ?", scope.tenantId,
  );
  const files = buildExport(scope, tenant?.name ?? "OfficeYak");
  const body = zip(files);

  logActivity(scope, {
    actorId: user.id,
    actorLabel: user.fullName,
    kind: "account.invited",
    summary: `${user.fullName} downloaded a full data export`,
    detail: { files: files.length },
  });

  const day = new Date().toISOString().slice(0, 10);
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="officeyak-${tenant?.slug ?? "export"}-${day}.zip"`,
      "Content-Length": String(body.length),
      // Never cached: it contains every family's details and it is different
      // every time it is asked for.
      "Cache-Control": "no-store, private",
    },
  });
}
