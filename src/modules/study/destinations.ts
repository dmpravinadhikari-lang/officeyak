import type { CountryCode } from "@/lib/countries";

/**
 * The written half of a destination page.
 *
 * The figures come from src/modules/cost/data.ts, which is sourced and dated.
 * This file is everything a figure cannot say: why a Nepali application to
 * this particular country gets refused, what the timeline actually looks like
 * from Kathmandu, and which step people leave too late.
 *
 * A destination only gets a page once somebody has written this properly for
 * it. Generating six near-identical pages from a template and swapping the
 * country name would rank for a week and then be recognised for what it is.
 * `DESTINATIONS` is therefore deliberately incomplete, and the route builds
 * pages only for the countries in it.
 */

export type Step = { when: string; what: string; detail: string };
export type Faq = { q: string; a: string };

export type Destination = {
  code: CountryCode;
  /** The URL segment. Reads better than the country code in a search result. */
  slug: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  /** One paragraph, before anything else, that tells the truth about the place. */
  opening: string;
  /** Why a Nepali file gets refused here specifically. */
  refusals: { title: string; body: string }[];
  timeline: Step[];
  faq: Faq[];
  /** Guides on this site that genuinely follow from this page. */
  related: { href: string; label: string }[];
};

export const DESTINATIONS: Destination[] = [
  {
    code: "UK",
    slug: "uk",
    h1: "Studying in the UK from Nepal",
    metaTitle: "Study in the UK from Nepal: cost, visa and funds",
    metaDescription:
      "What a UK degree costs from Nepal in rupees, the exact maintenance funds the Student Route asks you to show, and the 28 day rule that catches people out.",
    opening:
      "A one year masters is why most Nepali students choose the UK. It is the shortest route to a foreign postgraduate degree anywhere, which makes it the cheapest in total even though the yearly figure looks high. The part that catches families out is not the tuition. It is that the Home Office asks you to prove you already hold a specific amount of money, in one account, untouched for twenty eight days, and it publishes that figure to the pound.",
    refusals: [
      {
        title: "The 28 day rule, broken by a single deposit",
        body:
          "The maintenance money must sit in the account for 28 consecutive days, and the closing balance on your statement must be no more than 31 days old when you apply. A transfer that arrives on day 20 restarts the clock. So does the balance dipping below the required figure for one day. This is the single most common avoidable refusal on UK files from Nepal, and it is entirely a matter of planning the dates.",
      },
      {
        title: "The credibility interview contradicting the file",
        body:
          "Most UK universities interview Nepali applicants before issuing a CAS, and UKVI may interview again. The questions are not hard: why this course, why this university, who is paying, what you intend to do afterwards. What fails is a student who cannot explain, in their own words, a statement somebody else wrote for them. If your personal statement uses vocabulary you would not use out loud, it is working against you.",
      },
      {
        title: "Money whose source cannot be shown",
        body:
          "Having the amount is not the same as evidencing it. A large deposit shortly before the 28 day window, from someone whose relationship and income are not documented, reads as borrowed for the application. Land sold, a loan sanctioned, a relative abroad: all of these are fine, and all of them need paperwork that traces the money back to something real.",
      },
      {
        title: "A course that does not follow from your history",
        body:
          "A commerce graduate applying for a hospitality diploma is asked to explain the jump, and the explanation has to be about your career rather than about the fees. The UK looks harder at this than it used to, particularly where a masters is a step sideways from a bachelors in the same subject.",
      },
    ],
    timeline: [
      {
        when: "10 to 12 months before the intake",
        what: "Sit IELTS or PTE, and shortlist",
        detail:
          "Universities want the English score before they will make a serious offer. Book the test early: Kathmandu test centres fill up, and a retake needs a gap.",
      },
      {
        when: "8 to 10 months before",
        what: "Apply, and collect offers",
        detail:
          "Applying to four or five places is normal. A conditional offer is usual and is not a problem; it tells you exactly what is still missing.",
      },
      {
        when: "5 to 6 months before",
        what: "Start the 28 day money clock",
        detail:
          "This is the step people leave too late. Work backwards: the balance must sit untouched for 28 days, and the statement must be recent when you apply. Decide which single account holds it and stop moving money through it.",
      },
      {
        when: "4 months before",
        what: "Accept, pay the deposit, get the CAS",
        detail:
          "The CAS is the university's confirmation that they have a place for you. The visa application needs its number, so nothing proceeds until it arrives.",
      },
      {
        when: "3 months before",
        what: "The NOC from the Ministry of Education",
        detail:
          "Nepal's own step, and the one that lets your bank legally remit tuition. It is applied for online and usually takes a few working days once your documents agree with each other.",
      },
      {
        when: "2 to 3 months before",
        what: "Apply for the Student Route visa",
        detail:
          "Pay the application fee and the Immigration Health Surcharge, give biometrics, and submit. Check the current processing time on gov.uk before you promise anyone a date, because it moves.",
      },
    ],
    faq: [
      {
        q: "How much money do I need to show for a UK student visa?",
        a: "Your unpaid first year tuition, plus living costs of £1,171 a month for nine months outside London (£10,539) or £1,529 a month in London (£13,761). This is a published UKVI figure rather than an estimate, so it is the one number on a UK application you should never guess at. Check the current figure on gov.uk before you rely on it.",
      },
      {
        q: "What is the 28 day rule?",
        a: "The maintenance money has to sit in the account for 28 consecutive days without the balance dropping below the required amount, and the closing date on your statement must be no more than 31 days before you apply. A deposit part way through restarts the 28 days.",
      },
      {
        q: "Is a one year UK masters cheaper than a two year degree elsewhere?",
        a: "Usually yes in total, even though the yearly tuition is higher, because you pay one year of living costs instead of two and start earning a year earlier. Compare the whole course rather than the annual figure.",
      },
      {
        q: "Do I need an NOC to study in the UK?",
        a: "Yes. The No Objection Certificate from Nepal's Ministry of Education is what allows your bank to legally remit tuition abroad. It is a Nepali requirement, not a British one, and it is separate from the visa.",
      },
      {
        q: "Will I be interviewed?",
        a: "Most UK universities interview Nepali applicants for credibility before issuing a CAS, and UKVI may interview as well. Expect to be asked why this course, why this university, who is funding you and what you plan to do afterwards, and to answer in your own words.",
      },
      {
        q: "Can I work while studying in the UK?",
        a: "Student Route visa holders generally have limited term time working rights, with more hours permitted during vacations. Treat any earnings as a contribution rather than as part of your funding plan, because the visa requires you to show the money before you arrive.",
      },
    ],
    related: [
      { href: "/blog/noc-for-abroad-study-nepal", label: "The NOC, start to finish" },
      { href: "/blog/sop-mistakes-that-get-nepali-students-refused", label: "The sentences that sink a statement" },
      { href: "/blog/student-visa-refused-nepal-what-to-do-next", label: "Refused. What now?" },
    ],
  },
];

export const destinationSlugs = () => DESTINATIONS.map((d) => d.slug);
export const destinationBySlug = (slug: string) =>
  DESTINATIONS.find((d) => d.slug === slug) ?? null;
