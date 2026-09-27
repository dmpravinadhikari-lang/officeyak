import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader, SiteFooter, CtaBand } from "@/components/site-chrome";
import { Ridge } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import { Shot, TintTile } from "@/components/brand-ui";
import { BRAND } from "@/lib/brand";
import { SOFTWARE_PAGES, softwareBySlug, softwareSlugs } from "@/modules/software/pages";

/**
 * A software landing page: one part of the product, at the address somebody
 * searching for that part would type.
 *
 * The study pages answer a student's question. These answer an owner's, which
 * is a different kind of page: the reader is not looking for information, they
 * are deciding whether to trust us with their office. So the order is problem
 * first, then what the software does about it, then proof it exists in the form
 * of a real screenshot, then the objections.
 *
 * Every claim here has to be something the product does today. Before writing
 * any of this I checked the schema and the modules: class_attendance exists,
 * the geofence carries lat/lng/radius_m, and payroll reads the days worked in
 * the Nepali month. A page that promises a feature is a refund request with
 * better typography.
 */

export function generateStaticParams() {
  return softwareSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = softwareBySlug(slug);
  if (!p) return {};
  return {
    title: `${p.metaTitle} | ${BRAND.name}`,
    description: p.metaDescription,
    alternates: { canonical: `/software/${p.slug}` },
  };
}

export default async function SoftwarePage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = softwareBySlug(slug);
  if (!p) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        // The offer says free, because it is: there is a free tier and no card
        // is taken. Claiming a price here that the pricing page contradicts is
        // the one structured-data mistake Google acts on.
        "@type": "SoftwareApplication",
        name: BRAND.name,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: p.metaDescription,
        url: `https://${BRAND.domain}/software/${p.slug}`,
        offers: { "@type": "Offer", price: "0", priceCurrency: "NPR" },
      },
      {
        "@type": "FAQPage",
        mainEntity: p.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `https://${BRAND.domain}` },
          { "@type": "ListItem", position: 2, name: "Software", item: `https://${BRAND.domain}/software` },
          { "@type": "ListItem", position: 3, name: p.crumb, item: `https://${BRAND.domain}/software/${p.slug}` },
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
            <Link href="/software" className="hover:text-brand-600">Software</Link>
            <span aria-hidden>/</span>
            <span className="text-ink-2">{p.crumb}</span>
          </nav>

          <span className="mt-5 inline-flex rounded-md bg-tint-orange px-2.5 py-1.5 text-[12px] font-medium uppercase tracking-[0.5px] text-tint-orange-ink">
            {p.eyebrow}
          </span>
          <h1 className="display mt-4 max-w-[800px] text-[clamp(32px,4vw,50px)] leading-[1.06] tracking-[-0.035em] text-ink">
            {p.h1}
          </h1>
          <p className="mt-5 max-w-[640px] text-[18px] leading-[1.55] text-ink-2">{p.opening}</p>

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
            No card, no demo call, unlimited staff accounts on every plan.
          </p>
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0">
          <Ridge height={96} />
        </div>
      </section>

      {/* ------------------------------------------------------- the problem */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1200px] px-6 py-14 md:py-20">
          <span className="text-[12px] font-medium uppercase tracking-[0.5px] text-accent-500">
            Before the software
          </span>
          <h2 className="display mt-2.5 max-w-[760px] text-[clamp(26px,3vw,38px)] leading-[1.15] tracking-[-0.03em]">
            {p.problem.title}
          </h2>
          <p className="mt-5 max-w-[720px] text-[17px] leading-[1.65] text-[#D6D5E4]">
            {p.problem.body}
          </p>
        </div>
      </section>

      {/* -------------------------------------------------- what it actually does */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-[1200px] px-6 py-14 md:py-24">
          <span className="text-[12px] font-medium uppercase tracking-[0.5px] text-brand-600">
            What it does
          </span>
          <h2 className="display mt-2.5 text-[clamp(26px,3vw,38px)] leading-[1.15] tracking-[-0.03em]">
            Built, not on a roadmap
          </h2>
          <p className="mt-3 max-w-[620px] text-[16px] leading-[1.55] text-ink-2">
            Everything below is in the product today. Open a free account and you will find it there.
          </p>

          <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {p.capabilities.map((cap) => (
              <article key={cap.title} className="flex flex-col rounded-2xl border border-line bg-panel p-6">
                <TintTile icon={cap.icon} peak="run" size={38} />
                <h3 className="mt-4 text-[17px] font-semibold leading-snug text-ink">{cap.title}</h3>
                <p className="mt-2.5 text-[15px] leading-[1.6] text-ink-2">{cap.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ the screenshot */}
      <section className="bg-wash">
        <div className="mx-auto max-w-[1200px] px-6 py-14 md:py-24">
          <span className="text-[12px] font-medium uppercase tracking-[0.5px] text-brand-600">
            The actual screen
          </span>
          <h2 className="display mt-2.5 max-w-[680px] text-[clamp(26px,3vw,38px)] leading-[1.15] tracking-[-0.03em]">
            Not a mockup
          </h2>
          <p className="mt-3 max-w-[620px] text-[16px] leading-[1.55] text-ink-2">{p.shot.caption}</p>

          <Shot
            src={p.shot.src}
            alt={p.shot.alt}
            className="mt-8 shadow-[0_24px_60px_-30px_rgba(21,19,58,0.35)]"
          />
        </div>
      </section>

      {/* --------------------------------------------------------- built here */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-[1200px] px-6 py-14 md:py-24">
          <div className="grid gap-8 md:grid-cols-[1fr_1fr] md:gap-16">
            <div>
              <span className="text-[12px] font-medium uppercase tracking-[0.5px] text-brand-600">
                Why it fits
              </span>
              <h2 className="display mt-2.5 text-[clamp(26px,3vw,38px)] leading-[1.15] tracking-[-0.03em]">
                {p.local.title}
              </h2>
            </div>
            <p className="self-center text-[17px] leading-[1.65] text-ink-2">{p.local.body}</p>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- the faq */}
      <section className="bg-wash">
        <div className="mx-auto max-w-[820px] px-6 py-14 md:py-24">
          <h2 className="display text-[clamp(26px,3vw,38px)] leading-[1.15] tracking-[-0.03em]">
            Questions owners ask
          </h2>
          <dl className="mt-8 divide-y divide-line border-y border-line">
            {p.faq.map((f) => (
              <div key={f.q} className="py-5">
                <dt className="text-[17px] font-semibold text-ink">{f.q}</dt>
                <dd className="mt-2 text-[15px] leading-[1.6] text-ink-2">{f.a}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
            {p.related.map((r) => (
              <Link key={r.href} href={r.href} className="text-[15px] font-semibold text-brand-600 hover:underline">
                {r.label} &rarr;
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------- the other software pages */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-[1200px] px-6 pb-14 pt-4 md:pb-24">
          <span className="text-[12px] font-medium uppercase tracking-[0.5px] text-brand-600">
            The rest of it
          </span>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SOFTWARE_PAGES.filter((o) => o.slug !== p.slug).map((o) => (
              <Link
                key={o.slug}
                href={`/software/${o.slug}`}
                className="group rounded-2xl border border-line bg-panel p-5 transition-colors hover:border-brand-400"
              >
                <span className="text-[12px] font-medium uppercase tracking-[0.5px] text-muted">
                  {o.eyebrow}
                </span>
                <span className="mt-1.5 block text-[17px] font-semibold leading-snug text-ink group-hover:text-brand-600">
                  {o.h1}
                </span>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-600">
                  Read it <Icon name="arrow" size={15} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaBand action="Start free">
        Try it with your own students this week. Nothing is charged until you ask to be invoiced.
      </CtaBand>

      <SiteFooter />
    </main>
  );
}
