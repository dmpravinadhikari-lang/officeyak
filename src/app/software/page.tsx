import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter, CtaBand } from "@/components/site-chrome";
import { Ridge } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import { TintTile } from "@/components/brand-ui";
import { BRAND } from "@/lib/brand";
import { SOFTWARE_PAGES } from "@/modules/software/pages";

/**
 * The index the four software pages hang off.
 *
 * It exists so the cluster has a parent, and so somebody who arrives on the
 * attendance page from a search can find the rest of the product without
 * going back to the homepage. It deliberately says very little of its own:
 * the pages it links to carry the argument.
 */

export const metadata: Metadata = {
  title: `Software for education consultancies | ${BRAND.name}`,
  description:
    "One system for a consultancy: enquiries, student files, class registers, staff attendance and payroll. Free to start, and never a charge for having more students.",
  alternates: { canonical: "/software" },
};

export default function SoftwareIndex() {
  return (
    <main className="bg-canvas">
      <SiteHeader />

      <section className="relative overflow-hidden bg-canvas">
        <div className="relative z-10 mx-auto max-w-[1200px] px-6 pb-28 pt-12 md:pt-16">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[13px] text-muted">
            <Link href="/" className="hover:text-brand-600">Home</Link>
            <span aria-hidden>/</span>
            <span className="text-ink-2">Software</span>
          </nav>

          <h1 className="display mt-5 max-w-[800px] text-[clamp(32px,4vw,50px)] leading-[1.06] tracking-[-0.035em] text-ink">
            One system for the whole consultancy
          </h1>
          <p className="mt-5 max-w-[640px] text-[18px] leading-[1.55] text-ink-2">
            Most offices run four things that do not speak to each other: a sheet of enquiries, a
            folder of documents, a paper register and a payroll calculation somebody does by hand.
            OfficeYak is those four in one place, built in Nepal for the way the work actually runs.
          </p>

          <div className="mt-9 flex flex-wrap gap-2.5">
            <Link
              href="/signup"
              className="oy-press inline-flex min-h-[50px] items-center justify-center rounded-[10px] bg-brand-500 px-[22px] text-[16px] font-semibold text-ink transition-colors hover:bg-brand-400"
            >
              Start free in ten minutes
            </Link>
            <Link
              href="/#pricing"
              className="oy-press inline-flex min-h-[50px] items-center justify-center rounded-[10px] border border-line-2 bg-panel px-[22px] text-[16px] font-semibold text-ink transition-colors hover:border-brand-400 hover:text-brand-600"
            >
              See what it costs
            </Link>
          </div>
          <p className="mt-3.5 text-[14px] text-muted">
            No card, no demo call, and unlimited students on every plan.
          </p>
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0">
          <Ridge height={96} />
        </div>
      </section>

      <section className="bg-wash">
        <div className="mx-auto max-w-[1200px] px-6 py-14 md:py-24">
          <span className="text-[12px] font-medium uppercase tracking-[0.5px] text-brand-600">
            Four parts
          </span>
          <h2 className="display mt-2.5 text-[clamp(26px,3vw,38px)] leading-[1.15] tracking-[-0.03em]">
            Start wherever it hurts most
          </h2>
          <p className="mt-3 max-w-[620px] text-[16px] leading-[1.55] text-ink-2">
            They are one product, not four purchases. Every plan includes all of it.
          </p>

          <div className="mt-9 grid gap-5 md:grid-cols-2">
            {SOFTWARE_PAGES.map((p) => (
              <Link
                key={p.slug}
                href={`/software/${p.slug}`}
                className="group flex flex-col rounded-2xl border border-line bg-panel p-6 transition-colors hover:border-brand-400"
              >
                <TintTile icon={p.capabilities[0].icon} peak="run" size={40} />
                <span className="mt-4 text-[12px] font-medium uppercase tracking-[0.5px] text-muted">
                  {p.eyebrow}
                </span>
                <h3 className="mt-1.5 text-[20px] font-semibold leading-snug text-ink group-hover:text-brand-600">
                  {p.h1}
                </h3>
                <p className="mt-2.5 text-[15px] leading-[1.6] text-ink-2">{p.metaDescription}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-semibold text-brand-600">
                  Read it <Icon name="arrow" size={16} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaBand action="Start free">
        Try it with your own students this week. Thirty days free, and no card on file.
      </CtaBand>

      <SiteFooter />
    </main>
  );
}
