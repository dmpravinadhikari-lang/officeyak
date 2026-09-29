import Link from "next/link";
import { requireCapability } from "@/lib/auth/guard";
import {
  Alert, Card, Chip, Empty, PageHeader, ScrollHint, SeverityChip, StatTile, Th,
} from "@/components/ui";
import { Icon } from "@/components/Icon";
import { shortDate } from "@/lib/dates";
import { BRAND } from "@/lib/brand";
import {
  latestReport, reportHistory, openSuggestions, healthyStreak,
  type Report, type Finding,
} from "@/modules/seo/report";

export const metadata = { title: "Marketing, OfficeYak" };

/**
 * What the scheduled SEO agent did, for the person who owns the platform.
 *
 * This is deliberately not in the consultancy navigation. A consultancy owner
 * has `/app/market`, which is intelligence about what students are searching
 * for, and it is theirs. This is intelligence about how OfficeYak itself is
 * doing, which is nobody's business but the platform owner's, so it sits
 * behind the same capability as the rest of the admin console.
 *
 * The screen has one rule: never show a number the agent did not measure. A
 * run that could not reach Search Console produces a report with no search
 * block, and this page says so in words. Drawing a zero would be worse than
 * drawing nothing, because a zero looks like an answer.
 */

const when = (iso: string) => {
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 90) return `${Math.max(mins, 1)} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 36) return `${hrs} hours ago`;
  return shortDate(iso.slice(0, 10));
};

function FindingsTable({ findings }: { findings: Finding[] }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[620px] text-[13.5px]">
        <thead>
          <tr className="border-b border-line text-left">
            <Th>Page</Th><Th>What</Th><Th>How bad</Th><Th>Done</Th>
          </tr>
        </thead>
        <tbody>
          {findings.map((f, i) => (
            <tr key={`${f.url}-${f.kind}-${i}`} className="border-b border-line last:border-0">
              <td className="py-2.5 pr-3 align-top">
                <span className="mono text-[12.5px] text-ink-2">{f.url}</span>
              </td>
              <td className="py-2.5 pr-3 align-top text-ink-2">
                <span className="block font-medium text-ink">{f.kind}</span>
                {f.detail}
              </td>
              <td className="py-2.5 pr-3 align-top"><SeverityChip severity={f.severity} /></td>
              <td className="py-2.5 align-top">
                {f.fixed
                  ? <Chip tone="teal">Fixed</Chip>
                  : <Chip tone="gold">Left for you</Chip>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function MarketingPage() {
  await requireCapability("platform:admin");

  const latest = latestReport();
  const history = reportHistory(30);
  const suggestions = openSuggestions(latest ? [latest, ...history] : history);

  // Before the first run there is nothing to draw, and the honest thing is to
  // say what has to happen rather than show an empty dashboard that reads as
  // broken.
  if (!latest) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Marketing"
          sub={`What the scheduled agent found and did on ${BRAND.domain}. It runs every morning and writes its report into the repository, which arrives here with the next deploy.`}
        />
        <Empty icon={<Icon name="chart" size={22} />} title="No run has reported yet">
          The routine is scheduled but has not left a report. Until it does, this page has
          nothing true to show, so it shows nothing. The usual cause is that the cloud
          environment cannot reach {BRAND.domain}: the run stops at its first step and reports
          the block instead of writing a report. Open the routine on claude.ai, use the
          environment menu, choose Edit, and allow the domain.
        </Empty>
      </div>
    );
  }

  const streak = healthyStreak([latest, ...history]);
  const fixed = latest.audit?.findings.filter((f) => f.fixed) ?? [];
  const left = latest.audit?.findings.filter((f) => !f.fixed) ?? [];
  const needsYou = suggestions.filter((s) => s.needsYou);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Marketing"
        sub={`What the scheduled agent found and did on ${BRAND.domain}.`}
        actions={<Chip tone={latest.site.up ? "teal" : "danger"}>
          {latest.kind} run, {when(latest.runAt)}
        </Chip>}
      />

      {/* The site being down outranks everything else on the page. */}
      {!latest.site.up && !latest.site.unreachable && (
        <Alert tone="danger" title="The site was down when the agent checked">
          {BRAND.domain} answered {latest.site.status ?? "nothing"}. Nothing else in this
          report matters until that is fixed.
        </Alert>
      )}

      {/* Being unable to reach the site is a different problem from the site
          being down, and saying so is the whole point. */}
      {latest.site.unreachable && (
        <Alert tone="gold" title="The agent could not reach the site">
          {latest.site.unreachable} This is the environment&apos;s network policy, not an
          outage: the site may be perfectly healthy. Everything below is from whatever the
          run could still do without reaching it.
        </Alert>
      )}

      {latest.summary && (
        <Card>
          <div className="text-[12px] font-medium uppercase tracking-[0.5px] text-muted">
            What it said
          </div>
          <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink-2">
            {latest.summary}
          </p>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Site"
          value={latest.site.up ? "Up" : "Down"}
          sub={streak > 1 ? `${streak} runs in a row` : undefined}
          tone={latest.site.up ? "teal" : "danger"}
        />
        <StatTile
          label="Pages checked"
          value={latest.audit ? latest.audit.pagesChecked : "—"}
          sub={latest.site.sitemapUrls ? `${latest.site.sitemapUrls} in the sitemap` : undefined}
        />
        <StatTile
          label="Fixed on its own"
          value={latest.audit ? fixed.length : "—"}
          sub={left.length ? `${left.length} left for a person` : "nothing left over"}
          tone={fixed.length ? "teal" : "grey"}
        />
        <StatTile
          label="Published"
          value={latest.published ? 1 : 0}
          sub={latest.published?.keyword}
          tone={latest.published ? "brand" : "grey"}
        />
      </div>

      {/* ---------------------------------------------------- needs a person */}
      {needsYou.length > 0 && (
        <Card>
          <div className="flex items-center gap-2">
            <Icon name="alert" size={17} className="text-brand-600" />
            <h2 className="h-tight text-[16px]">Waiting on you</h2>
          </div>
          <p className="mt-1 text-[13px] text-muted">
            The agent stopped at these because only a person can clear them.
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {needsYou.map((s) => (
              <li key={s.title} className="rounded-xl border border-line bg-wash p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="text-[14.5px] font-semibold text-ink">{s.title}</span>
                  <SeverityChip severity={s.severity} />
                </div>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">{s.detail}</p>
                <p className="mt-2 text-[13px] text-brand-600">{s.needsYou}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* ------------------------------------------------------- what it wrote */}
      {latest.published && (
        <Card>
          <h2 className="h-tight text-[16px]">What it published</h2>
          <div className="mt-3 rounded-xl border border-line bg-wash p-4">
            <Link
              href={latest.published.url}
              className="text-[15px] font-semibold text-brand-600 hover:underline"
            >
              {latest.published.title}
            </Link>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
              <span>Targets <span className="text-ink-2">{latest.published.keyword}</span></span>
              {latest.published.words && <span>{latest.published.words} words</span>}
              {latest.published.kind && <span>{latest.published.kind}</span>}
            </div>
          </div>
        </Card>
      )}

      {/* ------------------------------------------------------------- search */}
      <Card>
        <h2 className="h-tight text-[16px]">Search</h2>
        {latest.search ? (
          <>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile label="Clicks, 28 days" value={latest.search.clicks.toLocaleString()} />
              <StatTile label="Impressions" value={latest.search.impressions.toLocaleString()} />
              <StatTile label="Click-through" value={`${(latest.search.ctr * 100).toFixed(1)}%`} />
              <StatTile label="Average position" value={latest.search.position.toFixed(1)} />
            </div>

            {latest.search.nearlyRanking?.length ? (
              <>
                <h3 className="mt-6 text-[14.5px] font-semibold text-ink">
                  Nearly ranking, worth an edit
                </h3>
                <p className="mt-1 text-[13px] text-muted">
                  Between position 5 and 15: pages search already understands and is nearly
                  willing to show. An edit here is worth more than a new page.
                </p>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[560px] text-[13.5px]">
                    <thead>
                      <tr className="border-b border-line text-left">
                        <Th>Query</Th><Th>Page</Th><Th>Position</Th><Th>Impressions</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {latest.search.nearlyRanking.map((q) => (
                        <tr key={`${q.query}-${q.page}`} className="border-b border-line last:border-0">
                          <td className="py-2.5 pr-3 text-ink">{q.query}</td>
                          <td className="py-2.5 pr-3"><span className="mono text-[12.5px] text-ink-2">{q.page}</span></td>
                          <td className="mono py-2.5 pr-3 text-ink-2">{q.position.toFixed(1)}</td>
                          <td className="mono py-2.5 text-ink-2">{q.impressions.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ScrollHint />
              </>
            ) : null}
          </>
        ) : (
          <Alert tone="gold" title="Search Console is not connected">
            Every figure on this card would have to be invented, so there are none. The agent
            needs a service account added as a user on the {BRAND.domain} property. Until then
            the weekly run cannot build the improvement list at all, and says so in its own
            report rather than guessing.
          </Alert>
        )}
      </Card>

      {/* -------------------------------------------------------- the audit */}
      {latest.audit && latest.audit.findings.length > 0 && (
        <Card>
          <h2 className="h-tight text-[16px]">What it found on the pages</h2>
          <p className="mt-1 text-[13px] text-muted">
            Anything a reader would not see a difference from, the agent fixes itself. Anything
            that would change how a page looks is left here for you to decide.
          </p>
          <FindingsTable findings={[...left, ...fixed]} />
          <ScrollHint />
        </Card>
      )}

      {/* --------------------------------------------------------- competitors */}
      {latest.competitors?.length ? (
        <Card>
          <h2 className="h-tight text-[16px]">Competitors</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {latest.competitors.map((c) => (
              <li key={c.name} className="rounded-xl border border-line bg-wash p-4">
                <span className="text-[14.5px] font-semibold text-ink">{c.name}</span>
                {c.newPages.length === 0 ? (
                  <p className="mt-1 text-[13.5px] text-muted">
                    Checked, published nothing.
                  </p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {c.newPages.map((p) => (
                      <li key={p.url} className="text-[13.5px]">
                        <a href={p.url} target="_blank" rel="noopener noreferrer nofollow"
                           className="text-brand-600 hover:underline">{p.title}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {/* ------------------------------------------------------------ skipped */}
      {latest.skipped?.length ? (
        <Card>
          <h2 className="h-tight text-[16px]">Skipped this run</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {latest.skipped.map((s) => (
              <li key={s.what} className="text-[13.5px] text-ink-2">
                <span className="font-medium text-ink">{s.what}</span>
                <span className="text-muted"> — {s.needs}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {/* ------------------------------------------------------------ history */}
      {history.length > 1 && (
        <Card>
          <h2 className="h-tight text-[16px]">Recent runs</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-[13.5px]">
              <thead>
                <tr className="border-b border-line text-left">
                  <Th>When</Th><Th>Run</Th><Th>Site</Th><Th>Fixed</Th><Th>Published</Th>
                </tr>
              </thead>
              <tbody>
                {history.map((r: Report) => (
                  <tr key={r.runAt} className="border-b border-line last:border-0">
                    <td className="py-2.5 pr-3 text-ink-2">{shortDate(r.runAt.slice(0, 10))}</td>
                    <td className="py-2.5 pr-3 text-muted">{r.kind}</td>
                    <td className="py-2.5 pr-3">
                      <Chip tone={r.site.up ? "teal" : "danger"}>{r.site.up ? "Up" : "Down"}</Chip>
                    </td>
                    <td className="mono py-2.5 pr-3 text-ink-2">
                      {r.audit ? r.audit.findings.filter((f) => f.fixed).length : "—"}
                    </td>
                    <td className="py-2.5 text-ink-2">
                      {r.published
                        ? <Link href={r.published.url} className="text-brand-600 hover:underline">{r.published.title}</Link>
                        : <span className="text-muted">nothing</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ScrollHint />
        </Card>
      )}
    </div>
  );
}
