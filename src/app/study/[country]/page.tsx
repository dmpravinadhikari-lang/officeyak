import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader, SiteFooter, CtaBand } from "@/components/site-chrome";
import { Ridge } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import { Kpi } from "@/components/brand-ui";
import { BRAND } from "@/lib/brand";
import { country } from "@/lib/countries";
import { COST, FX_NPR, RATES_AS_OF } from "@/modules/cost/data";
import { DESTINATIONS, destinationBySlug, destinationSlugs } from "@/modules/study/destinations";

/**
 * A destination page: what it costs from Nepal, and what the visa asks for.
 *
 * Built at the address a person actually searches, /study/uk rather than a
 * calculator with a dropdown, because "study in the UK" and "cost of student
 * visa to the UK" are different questions from "what does studying abroad
 * cost" and deserve a page that answers only them.
 *
 * Every figure on it comes from src/modules/cost/data.ts, which carries its
 * own source and date, and the file separates two kinds of number that must
 * never be confused: the visa funds requirement is a published rule, and
 * everything else is an estimate for planning. The page keeps them apart on
 * screen for the same reason.
 *
 * Only countries with written content in DESTINATIONS get a page. Generating
 * six near-identical pages from a template with the country name swapped
 * would rank briefly and then be recognised for what it is.
 */

export function generateStaticParams() {
  return destinationSlugs().map((c) => ({ country: c }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country: slug } = await params;
  const d = destinationBySlug(slug);
  if (!d) return {};
  return {
    title: `${d.metaTitle} | ${BRAND.name}`,
    description: d.metaDescription,
    alternates: { canonical: `/study/${d.slug}` },
  };
}

const npr = (n: number) =>
  n >= 100000 ? `NPR ${(Math.round(n / 10000) / 10).toFixed(1)} lakh` : `NPR ${Math.round(n).toLocaleString("en-IN")}`;

export default async function DestinationPage({
  params,
}: { params: Promise<{ country: string }> }) {
  const { country: slug } = await params;
  const d = destinationBySlug(slug);
  if (!d) notFound();

  // A destination either has figures in the cost data or it does not. Where it
  // does not, the page keeps its shape and drops the cost table, rather than
  // filling it with numbers nobody sourced.
  const c = d.code ? country(d.code) : null;
  const name = c?.name ?? d.standalone?.name ?? d.h1;
  const flag = c?.flag ?? d.standalone?.flag ?? "";
  const visaName = c?.visa ?? d.standalone?.visa ?? "Student visa";

  const cost = d.code ? COST[d.code] : null;
  const rate = cost ? FX_NPR[cost.currency] : 0;
  const sym = cost ? ({ GBP: "£", AUD: "A$", NZD: "NZ$", EUR: "€", USD: "$", CAD: "C$" }[cost.currency] ?? "") : "";

  const tuition = cost ? cost.tuition.masters.typical : 0;
  // The published rule: first year tuition still owed, plus the maintenance
  // figure. Shown alongside its own formula so nobody has to trust the total.
  const fundsForeign = cost ? cost.visaFunds.living + tuition : 0;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: d.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `https://${BRAND.domain}` },
          { "@type": "ListItem", position: 2, name, item: `https://${BRAND.domain}/study/${d.slug}` },
        ],
      },
    ],
  };

  return (
    <main className="bg-canvas">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <SiteHeader />

      {/* ------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden bg-canvas">
        <div className="relative z-10 mx-auto max-w-[1200px] px-6 pb-28 pt-12 md:pt-16">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[13px] text-muted">
            <Link href="/" className="hover:text-brand-600">Home</Link>
            <span aria-hidden>/</span>
            <span className="text-ink-2">{name}</span>
          </nav>

          <span className="mt-5 inline-flex rounded-md bg-tint-orange px-2.5 py-1.5 text-[12px] font-medium uppercase tracking-[0.5px] text-tint-orange-ink">
            {flag} {visaName}
          </span>
          <h1 className="display mt-4 max-w-[760px] text-[clamp(32px,4vw,50px)] leading-[1.06] tracking-[-0.035em] text-ink">
            {d.h1}
          </h1>
          <p className="mt-5 max-w-[620px] text-[18px] leading-[1.55] text-ink-2">{d.opening}</p>

          <div className="mt-9 flex flex-wrap gap-2.5">
            <Link
              href="/tools/cost"
              className="inline-flex min-h-[50px] items-center justify-center rounded-[10px] bg-brand-500 px-[22px] text-[16px] font-semibold text-ink transition-colors hover:bg-brand-400"
            >
              Work out your own figure
            </Link>
            <Link
              href="/tools/eligibility"
              className="inline-flex min-h-[50px] items-center justify-center rounded-[10px] border border-line-2 bg-panel px-[22px] text-[16px] font-semibold text-ink transition-colors hover:border-brand-400 hover:text-brand-600"
            >
              Check if you are eligible
            </Link>
          </div>
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0">
          <Ridge height={96} />
        </div>
      </section>

      {/* ------------------------------------------------ the money, as a rule */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1200px] px-6 py-14 md:py-20">
          <span className="text-[12px] font-medium uppercase tracking-[0.5px] text-accent-500">
            A published rule, not an estimate
          </span>
          <h2 className="display mt-2.5 max-w-[720px] text-[clamp(26px,3vw,38px)] leading-[1.15] tracking-[-0.03em]">
            What the visa asks you to show
          </h2>

          {cost ? (
            <div className="mt-9 grid gap-8 sm:grid-cols-3">
              <Kpi
                tone="dark" peak="grow" size={30}
                value={`${sym}${cost.visaFunds.living.toLocaleString("en-US")}`}
                label="Living costs to evidence"
                sub={npr(cost.visaFunds.living * rate)}
              />
              <Kpi
                tone="dark" peak="prepare" size={30}
                value={`${sym}${tuition.toLocaleString("en-US")}`}
                label="Plus first year tuition still owed"
                sub={`typical masters, ${npr(tuition * rate)}`}
              />
              <Kpi
                tone="dark" peak="run" size={30}
                value={npr(fundsForeign * rate)}
                label="So, roughly, in the bank"
                sub={`at ${sym}1 = NPR ${rate}, ${RATES_AS_OF}`}
              />
            </div>
          ) : d.funds ? (
            <div className="mt-9">
              <Kpi
                tone="dark" peak="grow" size={34}
                value={d.funds.headline}
                label="What you must evidence"
                sub={d.funds.sub}
              />
            </div>
          ) : null}

          <div className="mt-9 max-w-[760px] rounded-2xl bg-white/[0.07] p-6">
            <p className="text-[15px] leading-[1.6] text-white">
              {cost ? cost.visaFunds.formula : d.funds?.formula}
            </p>
            <p className="mt-3 text-[15px] leading-[1.6] text-[#B9B8CC]">
              {cost ? cost.visaFunds.holding : d.funds?.holding}
            </p>
            <p className="mt-4 border-t border-white/15 pt-3 text-[13px] text-[#8A899E]">
              Source: {cost ? cost.visaFunds.source : d.funds?.source}. Check the current figure on
              the government&apos;s own site before you rely on it; it changes, and a page is not an
              authority.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- what it all costs */}
      {cost && (
      <section className="bg-wash">
        <div className="mx-auto max-w-[1200px] px-6 py-14 md:py-24">
          <span className="text-[12px] font-medium uppercase tracking-[0.5px] text-brand-600">
            Estimates, for planning
          </span>
          <h2 className="display mt-2.5 text-[clamp(26px,3vw,38px)] leading-[1.15] tracking-[-0.03em]">
            What it actually costs
          </h2>
          <p className="mt-3 max-w-[620px] text-[16px] leading-[1.55] text-ink-2">
            These are ranges for planning, not a quote. Once you hold an offer letter, type your own
            tuition into the calculator and ignore the middle column.
          </p>

          <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-panel">
            <table className="w-full min-w-[560px] text-[14px]">
              <thead>
                <tr className="border-b border-line bg-wash text-left">
                  {["", "Lower", "Typical", "Higher"].map((h) => (
                    <th key={h} className="px-5 py-3 text-[12px] font-medium uppercase tracking-[0.5px] text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {([
                  ["Tuition, masters, per year", cost.tuition.masters],
                  ["Tuition, bachelors, per year", cost.tuition.bachelors],
                  ["Tuition, diploma, per year", cost.tuition.diploma],
                ] as const).map(([label, t]) => (
                  <tr key={label} className="border-b border-line">
                    <td className="px-5 py-3 text-ink-2">{label}</td>
                    {[t.low, t.typical, t.high].map((v, i) => (
                      <td key={i} className="mono px-5 py-3 text-ink">
                        {sym}{v.toLocaleString("en-US")}
                        <span className="block text-[12px] text-muted">{npr(v * rate)}</span>
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-b border-line">
                  <td className="px-5 py-3 text-ink-2">Living, per year</td>
                  {[cost.living.low, cost.living.typical, cost.living.high].map((v, i) => (
                    <td key={i} className="mono px-5 py-3 text-ink">
                      {sym}{v.toLocaleString("en-US")}
                      <span className="block text-[12px] text-muted">{npr(v * rate)}</span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-line last:border-0">
                  <td className="px-5 py-3 text-ink-2">
                    One off
                    <span className="block text-[12px] text-muted">
                      visa fee, {cost.healthCoverName.toLowerCase()}, flight
                    </span>
                  </td>
                  <td className="mono px-5 py-3 text-ink" colSpan={3}>
                    {sym}{cost.visaFee} visa · {sym}{cost.healthCoverPerYear} a year ·{" "}
                    {npr(cost.oneOff.flightNpr)} flight from Kathmandu
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-[13px] text-muted">
            Converted at {sym}1 = NPR {rate}, set {RATES_AS_OF}. Rates move; the calculator uses the
            same figures and shows the date it was last updated.
          </p>

          <Link href="/tools/cost" className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold text-brand-600 hover:gap-2.5">
            Put your own numbers in <Icon name="arrow" size={16} />
          </Link>
        </div>
      </section>
      )}

      {/* -------------------------------------------------------- the timeline */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-[1200px] px-6 py-14 md:py-24">
          <span className="text-[12px] font-medium uppercase tracking-[0.5px] text-brand-600">From Kathmandu</span>
          <h2 className="display mt-2.5 text-[clamp(26px,3vw,38px)] leading-[1.15] tracking-[-0.03em]">
            When to do what
          </h2>
          <p className="mt-3 max-w-[620px] text-[16px] leading-[1.55] text-ink-2">
            Dated backwards from the intake, because that is the only fixed point. The step people
            leave too late is marked.
          </p>

          <ol className="mt-8 flex flex-col divide-y divide-line border-y border-line">
            {d.timeline.map((s) => (
              <li key={s.what} className="grid gap-2 py-5 sm:grid-cols-[210px_1fr] sm:gap-6">
                <span className="text-[13px] font-medium text-brand-600">{s.when}</span>
                <span>
                  <span className="block text-[16px] font-semibold text-ink">{s.what}</span>
                  <span className="mt-1 block text-[15px] leading-[1.55] text-ink-2">{s.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* -------------------------------------------------------- the refusals */}
      <section className="bg-wash">
        <div className="mx-auto max-w-[1200px] px-6 py-14 md:py-24">
          <span className="text-[12px] font-medium uppercase tracking-[0.5px] text-brand-600">Why files fail</span>
          <h2 className="display mt-2.5 text-[clamp(26px,3vw,38px)] leading-[1.15] tracking-[-0.03em]">
            What gets a Nepali application refused here
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {d.refusals.map((r) => (
              <article key={r.title} className="rounded-2xl border border-line bg-panel p-6">
                <h3 className="text-[17px] font-semibold leading-snug text-ink">{r.title}</h3>
                <p className="mt-2.5 text-[15px] leading-[1.6] text-ink-2">{r.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- the faq */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-[820px] px-6 py-14 md:py-24">
          <h2 className="display text-[clamp(26px,3vw,38px)] leading-[1.15] tracking-[-0.03em]">
            Questions families ask
          </h2>
          <dl className="mt-8 divide-y divide-line border-y border-line">
            {d.faq.map((f) => (
              <div key={f.q} className="py-5">
                <dt className="text-[17px] font-semibold text-ink">{f.q}</dt>
                <dd className="mt-2 text-[15px] leading-[1.6] text-ink-2">{f.a}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
            {d.related.map((r) => (
              <Link key={r.href} href={r.href} className="text-[15px] font-semibold text-brand-600 hover:underline">
                {r.label} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaBand action="Start free">
        Running a consultancy? OfficeYak keeps every student&apos;s file, documents and deadlines in one place.
      </CtaBand>

      <SiteFooter />
    </main>
  );
}
