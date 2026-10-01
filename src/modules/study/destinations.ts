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
  /**
   * Set only where src/modules/cost/data.ts has figures for this country.
   * Where it is absent the page drops its cost table rather than inventing
   * one, and says in the open that the numbers are not ours to publish yet.
   */
  code?: CountryCode;
  /** Name, flag and visa, for the destinations with no entry in the cost data. */
  standalone?: { name: string; flag: string; visa: string };
  /**
   * A published funds requirement for a country outside the cost data.
   * `headline` is the figure as the authority states it; `sub` is the same
   * thing in rupees or a plain restatement, and is optional because not every
   * country publishes a figure at all.
   */
  funds?: {
    headline: string;
    sub?: string;
    formula: string;
    source: string;
    holding: string;
    /** When a run last checked this against the authority. Not rendered. */
    checkedOn: string;
  };
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
  {
    code: "CA",
    slug: "canada",
    h1: "Studying in Canada from Nepal",
    metaTitle: "Study in Canada from Nepal: cost, study permit and funds",
    metaDescription:
      "What Canada costs from Nepal in rupees, the living-cost threshold IRCC asks for, and why the provincial attestation letter now decides whether you can apply.",
    opening:
      "Canada changed more than any other destination in the last two years, and most of what Nepali students were told about it is now out of date. The Student Direct Stream is gone, so there is no fast lane. A provincial attestation letter is required before you can even submit, and the college has to be able to issue you one. The money is still the main hurdle, but the paperwork order in front of it is new.",
    refusals: [
      {
        title: "No provincial attestation letter, so the file is returned unopened",
        body:
          "Most study permit applications now need a provincial attestation letter from the province where the institution sits. Provinces receive a limited allocation and distribute it among their institutions, so a college that could issue one in January may not be able to in June. Confirm the institution can issue you a letter before you pay any deposit, not after.",
      },
      {
        title: "The GIC covering living costs, and nothing covering tuition",
        body:
          "A Guaranteed Investment Certificate is the usual way to satisfy the living-cost portion, and because it is such a clean piece of evidence people assume it is the whole requirement. It is not. You must also show first year tuition, paid or available, and return travel. A file with a perfect GIC and no tuition evidence is incomplete.",
      },
      {
        title: "A study plan that reads as immigration rather than study",
        body:
          "An officer is asking whether the course makes sense for your career and whether you intend to leave at the end of it. A masters that is a sideways step from your bachelors, in a field unrelated to anything you have done, invites the conclusion that the course is a means rather than the purpose. Say plainly what the qualification is for and what you will do with it in Nepal.",
      },
      {
        title: "Money that appeared recently, from somewhere undocumented",
        body:
          "Land sold, a loan sanctioned, a relative abroad, all of these are acceptable and all of them need paperwork. A balance that arrived weeks before the application, with no trace of where it came from, is the most common financial refusal on Nepali files. Trace every significant deposit to a document.",
      },
    ],
    timeline: [
      { when: "10 to 12 months before", what: "Sit IELTS or PTE", detail: "Canada accepts several tests but the institution decides which. Confirm what yours takes before you book." },
      { when: "9 to 10 months before", what: "Apply, and confirm the attestation letter", detail: "Ask the institution directly whether it can issue a provincial attestation letter for your intake. This is the question that decides whether the rest is possible." },
      { when: "7 months before", what: "Accept, pay the deposit, get the letter of acceptance", detail: "The letter of acceptance and the attestation letter are two different documents and you need both." },
      { when: "6 months before", what: "Buy the GIC and assemble the rest of the funds", detail: "The GIC covers living costs. Tuition and travel are evidenced separately, so work out the full figure rather than the GIC figure." },
      { when: "4 to 5 months before", what: "The NOC from the Ministry of Education", detail: "Nepal's own step, and what allows your bank to remit tuition legally. Separate from anything Canada asks for." },
      { when: "3 to 4 months before", what: "Apply for the study permit, give biometrics", detail: "Processing times from Nepal move, and they lengthen before a major intake. Check the current figure on the IRCC site rather than assuming last year's." },
    ],
    faq: [
      { q: "How much money do I need for a Canadian study permit?", a: "The living-cost threshold for a single applicant, plus first year tuition and return travel. The living figure is set by IRCC and rises most years, so check the current one on the IRCC site rather than relying on a number you were told last intake." },
      { q: "Is SDS still available?", a: "No. The Student Direct Stream was discontinued, so applications from Nepal go through the standard study permit route. Anyone offering you an SDS application is working from old information." },
      { q: "What is a provincial attestation letter?", a: "A letter from the province confirming your place counts against its allocation. Most study permit applications need one, the institution obtains it, and without it the application cannot proceed. Confirm your institution can issue one before paying a deposit." },
      { q: "Does a GIC cover everything?", a: "No. It satisfies the living-cost portion. You still need to evidence first year tuition and return travel separately." },
      { q: "Can I work while studying in Canada?", a: "Study permit holders generally have limited working rights during term and more during scheduled breaks, subject to conditions printed on the permit. Treat it as a contribution rather than as part of the funding you show." },
      { q: "Do I need an NOC?", a: "Yes. The No Objection Certificate from Nepal's Ministry of Education is what lets your bank legally remit tuition abroad. It is a Nepali requirement and is separate from the study permit." },
    ],
    related: [
      { href: "/blog/canada-study-permit-from-nepal", label: "Canada, now that SDS is gone" },
      { href: "/blog/noc-for-abroad-study-nepal", label: "The NOC, start to finish" },
      { href: "/blog/student-visa-refused-nepal-what-to-do-next", label: "Refused. What now?" },
    ],
  },
  {
    code: "US",
    slug: "usa",
    h1: "Studying in the USA from Nepal",
    metaTitle: "Study in the USA from Nepal: cost, F-1 visa and funds",
    metaDescription:
      "What an American degree costs from Nepal, why there is no fixed funds figure for an F-1, and what actually happens in the four minutes at the Kathmandu window.",
    opening:
      "The United States is the only one of these destinations with no published funds threshold. There is no figure to look up. Your I-20 states the cost of attendance for one year at your institution, and that is the number you must cover, which means two students from the same class can face amounts that differ by three times. The second difference is that the decision is made by a person, in a few minutes, at the embassy in Kathmandu.",
    refusals: [
      {
        title: "Section 214(b), which is about intent rather than paperwork",
        body:
          "Every applicant is presumed to intend to immigrate until they show otherwise. A 214(b) refusal is not a comment on your documents; it is the officer not being persuaded that you will return. It carries no appeal and no ban, and you may reapply, but reapplying without changing anything produces the same answer.",
      },
      {
        title: "Not knowing your own I-20",
        body:
          "The cost of attendance on your I-20 is the figure you are expected to cover. Students arrive at the window unable to say what their own tuition is, what the total on the form says, or how the gap between that and their funds is met. It is a short conversation and that answer is most of it.",
      },
      {
        title: "A sponsor who cannot be connected to the money",
        body:
          "American officers look harder at the source of funds than at the balance. An uncle in the Gulf, a family business, a property sale, all workable, all requiring that the relationship and the income can be shown. A sponsor whose declared income cannot support the figure raises the obvious question.",
      },
      {
        title: "Answers that were memorised",
        body:
          "Officers interview all day and recognise recitation immediately. The questions are predictable: why this university, why this course, who is paying, what will you do after. Rehearse so you have said it aloud once, not so you have learned a script.",
      },
    ],
    timeline: [
      { when: "12 to 14 months before", what: "Sit the tests", detail: "Most institutions want TOEFL, IELTS or PTE, and many graduate programmes want the GRE or GMAT. Start earlier than for any other destination, because there are more tests." },
      { when: "10 to 12 months before", what: "Apply", detail: "American deadlines are earlier than most students expect, and funding decisions follow admission rather than accompany it." },
      { when: "6 to 8 months before", what: "Accept, and receive the I-20", detail: "The I-20 is issued by the institution and states the cost of attendance. Read it properly; it is the figure the whole financial case is built on." },
      { when: "5 months before", what: "Pay the SEVIS fee and complete the DS-160", detail: "The SEVIS fee is separate from the visa application fee and must be paid before the interview. Keep the receipt." },
      { when: "4 months before", what: "Book the interview, and the NOC", detail: "Interview slots in Kathmandu are scarce before a major intake. Book as soon as the SEVIS payment clears, and apply for the NOC in parallel." },
      { when: "3 months before", what: "Rehearse, then attend", detail: "Say your answers out loud to somebody before you say them to an officer. Take the I-20, the financial evidence and the receipts, organised so you can hand over what is asked for." },
    ],
    faq: [
      { q: "How much money do I need for an F-1 visa?", a: "There is no national threshold. The cost of attendance printed on your I-20 is the amount for one year, and you must show funds covering it. That figure is set by your institution, so it varies widely between applicants." },
      { q: "What is a 214(b) refusal?", a: "A refusal on the grounds that the officer was not satisfied you intend to return to Nepal after your studies. There is no appeal, and you may reapply, but reapplying without a materially different case usually produces the same result." },
      { q: "How long is the interview?", a: "Usually a few minutes. Most of it is your course, your funding and your plans afterwards. Short, specific answers with real numbers do better than long explanations." },
      { q: "Is the SEVIS fee the same as the visa fee?", a: "No, they are separate payments made at different stages. The SEVIS fee is paid before the interview and the receipt is taken with you." },
      { q: "Can I work on an F-1?", a: "On-campus work is generally permitted within limits, and off-campus work requires specific authorisation tied to your programme. It is not a funding plan, and the officer will not treat it as one." },
      { q: "Does a previous refusal from another country matter?", a: "Yes, and you must declare it. An undisclosed refusal found later turns a recoverable problem into a misrepresentation finding, which is far more serious than the original refusal." },
    ],
    related: [
      { href: "/blog/f1-visa-interview-questions-nepal", label: "Four minutes at the window" },
      { href: "/blog/sop-mistakes-that-get-nepali-students-refused", label: "The sentences that sink a statement" },
      { href: "/blog/student-visa-refused-nepal-what-to-do-next", label: "Refused. What now?" },
    ],
  },
  {
    code: "AU",
    slug: "australia",
    h1: "Studying in Australia from Nepal",
    metaTitle: "Study in Australia from Nepal: cost, subclass 500 and funds",
    metaDescription:
      "What Australia costs from Nepal in rupees, the funds Home Affairs asks you to show, and what the Genuine Student requirement is actually testing.",
    opening:
      "Australia takes more Nepali students than anywhere else, which cuts both ways. The route is well worn and every counsellor knows it, and for the same reason Home Affairs looks at Nepali files closely. The Genuine Temporary Entrant test was replaced by the Genuine Student requirement, and the change was not cosmetic: the questions are more direct and they are answered in writing, by you, before anyone reads your statement.",
    refusals: [
      {
        title: "The Genuine Student answers contradicting the rest of the file",
        body:
          "You answer a set of direct questions about your circumstances, your ties to Nepal, why this course and why Australia rather than studying at home. Those answers sit alongside your statement and your history, and an officer reads all three together. The failure is not a wrong answer, it is three documents telling slightly different stories.",
      },
      {
        title: "Funds that exist but are not demonstrably available",
        body:
          "Home Affairs asks for twelve months of living costs, twelve months of tuition and return travel. The wording that matters is that funds be genuinely available to you. Money in a relative's account that has never moved, or a balance assembled the month before, meets the figure without meeting the test.",
      },
      {
        title: "A course that lowers your level of study",
        body:
          "A student with a bachelors applying for a diploma is asked why, and the honest answer is often that the diploma was cheaper or easier to get into. That reads as a visa pathway rather than an education plan. If the step down is genuine, and sometimes it is, the file has to argue it rather than hope it goes unnoticed.",
      },
      {
        title: "A previous refusal not declared",
        body:
          "Countries share this information. An undisclosed refusal turns a survivable problem into a finding of misrepresentation, which can carry a multi-year exclusion. Declare it and address it directly.",
      },
    ],
    timeline: [
      { when: "10 to 12 months before", what: "Sit IELTS or PTE", detail: "Australia accepts several tests and most institutions publish the score they want by course. Check the course, not the university." },
      { when: "8 to 10 months before", what: "Apply, and collect offers", detail: "Conditional offers are normal. The condition is usually the English score or a final transcript." },
      { when: "6 months before", what: "Accept, pay the deposit, get the CoE", detail: "The Confirmation of Enrolment is what the visa application needs. Nothing proceeds without it." },
      { when: "5 to 6 months before", what: "Assemble the financial evidence", detail: "Twelve months living, twelve months tuition, return travel, held in a way that shows the money is genuinely yours to use. Start this before the CoE, not after." },
      { when: "4 months before", what: "Arrange OSHC and the NOC", detail: "Overseas Student Health Cover is compulsory and usually paid for the whole visa length at once. The NOC runs in parallel and is a Nepali requirement." },
      { when: "3 months before", what: "Lodge the subclass 500", detail: "Answer the Genuine Student questions yourself, in your own words, and make sure they agree with your statement. Check current processing times rather than assuming." },
    ],
    faq: [
      { q: "How much money do I need for an Australian student visa?", a: "Twelve months of living costs at the figure Home Affairs publishes, plus twelve months of tuition and return travel. The living figure is reviewed and has risen more than once, so check the current one on the Home Affairs site." },
      { q: "What replaced the GTE?", a: "The Genuine Student requirement. You answer specific questions about your circumstances and intentions in the application itself, rather than relying on a statement alone." },
      { q: "Is OSHC compulsory?", a: "Yes. Overseas Student Health Cover must be held for the length of your visa and is normally paid up front for the whole period." },
      { q: "Can I work while studying in Australia?", a: "Student visa holders have capped working rights during term and more during breaks. The cap changes, so check the current limit. It is not part of the funds you must show." },
      { q: "Does Australia care that I applied elsewhere first?", a: "It cares that you declare it. A previous refusal must be disclosed, and an undisclosed one is treated far more seriously than the refusal itself." },
      { q: "Do I need an NOC for Australia?", a: "Yes. It is Nepal's requirement rather than Australia's, and without it your bank cannot legally remit your tuition." },
    ],
    related: [
      { href: "/blog/noc-for-abroad-study-nepal", label: "The NOC, start to finish" },
      { href: "/blog/sop-mistakes-that-get-nepali-students-refused", label: "The sentences that sink a statement" },
      { href: "/tools/cost", label: "Work out the whole cost" },
    ],
  },
  {
    code: "NZ",
    slug: "new-zealand",
    h1: "Studying in New Zealand from Nepal",
    metaTitle: "Study in New Zealand from Nepal: cost, visa and funds",
    metaDescription:
      "What New Zealand costs from Nepal in rupees, the yearly living figure Immigration New Zealand asks you to show, and what genuine intent means in practice.",
    opening:
      "Fewer Nepali students go to New Zealand than to Australia, and that is the interesting thing about it. The volume is lower, the institutions are smaller, and the file gets read rather than processed. Immigration New Zealand weighs genuine intent heavily, which favours a student with a coherent reason for being there and works against one whose application looks like a template.",
    refusals: [
      {
        title: "Genuine intent, which is judged on the whole file",
        body:
          "Immigration New Zealand asks whether you are genuinely coming to study and genuinely intend to comply with your visa. There is no single document that proves this. It is assembled from your course choice, your academic history, your finances and what you say about afterwards, and an application where those four do not agree is where the doubt comes from.",
      },
      {
        title: "Funds that are present but not verifiable",
        body:
          "The yearly living figure plus full tuition has to be shown, and it has to be capable of being checked. A statement from an account with no history, or a sponsor letter with nothing behind it, satisfies the arithmetic and not the requirement.",
      },
      {
        title: "A course chosen for the pathway rather than the subject",
        body:
          "New Zealand is explicit that a student visa is for study. A course picked because it is the cheapest route to a work right, with no connection to anything you have done, is the pattern officers are looking for and it is visible.",
      },
      {
        title: "Medical and character requirements left too late",
        body:
          "Depending on the length of your course you may need a medical examination and a police certificate from Nepal. Both take time, and both are commonly started after the visa application rather than before it, which is how a September intake becomes a February one.",
      },
    ],
    timeline: [
      { when: "10 to 12 months before", what: "Sit IELTS or PTE", detail: "Check the score the specific programme wants rather than the institution's general minimum." },
      { when: "8 to 10 months before", what: "Apply", detail: "New Zealand institutions are smaller and often respond faster than Australian ones, but intakes are fewer, so missing one costs more." },
      { when: "6 months before", what: "Accept and pay the deposit", detail: "The offer of place is what the visa application is built on." },
      { when: "5 months before", what: "Start the police certificate and medical", detail: "Both come from Nepal and both take longer than people plan for. Starting these early is the single biggest time saving on a New Zealand file." },
      { when: "4 months before", what: "Assemble funds and apply for the NOC", detail: "A year of living costs plus full tuition, evidenced so it can be verified. The NOC runs alongside." },
      { when: "3 months before", what: "Apply for the Fee Paying Student visa", detail: "Answer the intent questions yourself and make sure they agree with your statement and your history." },
    ],
    faq: [
      { q: "How much money do I need for a New Zealand student visa?", a: "A published yearly living figure plus full tuition for the year. Immigration New Zealand sets the living amount and it is quoted per year, or per month for courses under a year. Check the current figure on the Immigration New Zealand site." },
      { q: "What does genuine intent mean?", a: "That you are coming to study and intend to comply with your visa. It is judged from the whole application rather than from one document, so the course, the finances and your stated plans afterwards all have to agree." },
      { q: "Do I need a medical examination?", a: "Often, depending on the length of your course and your circumstances. Along with a police certificate from Nepal it should be started months before you apply, not after." },
      { q: "Is New Zealand easier than Australia?", a: "Different rather than easier. Fewer applications means your file is more likely to be read carefully, which helps a coherent application and does not help a weak one." },
      { q: "Can I work while studying?", a: "Many student visas allow limited work during term and more during scheduled breaks, subject to the conditions on your visa. It is not counted as part of the funds you must show." },
      { q: "Do I need an NOC?", a: "Yes. It is Nepal's requirement, it lets your bank remit tuition legally, and it is separate from anything New Zealand asks for." },
    ],
    related: [
      { href: "/tools/compare", label: "Compare destinations side by side" },
      { href: "/blog/noc-for-abroad-study-nepal", label: "The NOC, start to finish" },
      { href: "/tools/cost", label: "Work out the whole cost" },
    ],
  },
  {
    slug: "japan",
    standalone: { name: "Japan", flag: "🇯🇵", visa: "Student residence status" },
    h1: "Studying in Japan from Nepal",
    metaTitle: "Study in Japan from Nepal: cost, visa and funds",
    metaDescription:
      "What Japan asks a Nepali student to prove financially, why the school sets the figure rather than the government, and how the Certificate of Eligibility works.",
    opening:
      "Japan works back to front compared with every other destination here. You do not apply for a visa and then enrol. Your school applies to the immigration bureau for a Certificate of Eligibility on your behalf, and only once that is granted do you take it to the embassy for the visa itself. This means the school is your first gatekeeper and your financial evidence is read by them before anyone official sees it.",
    funds: {
      headline: "No published figure",
      sub: "the school sets the amount through the Certificate of Eligibility",
      formula:
        "Japan does not publish a single national minimum for student residence status. The requirement is that you can pay tuition and living costs for the whole programme without relying on illegal work. Schools apply that principle as their own threshold, and for a one year programme they commonly ask to see in the region of two million yen, which varies by school, city and course type.",
      source:
        "Immigration Services Agency of Japan and the Ministry of Foreign Affairs set the principle; individual schools set the amount",
      holding:
        "The sponsor's relationship to you, their income and the source of the money are examined at least as closely as the balance. A recently assembled figure with nothing behind it fails here as it does everywhere.",
      checkedOn: "2026-10-01",
    },
    refusals: [
      {
        title: "The school rejects the file before immigration ever sees it",
        body:
          "Because the school submits the Certificate of Eligibility application, it carries the risk if a student disappears or cannot pay. Schools with a poor track record on that face scrutiny themselves, so they screen hard. A weak financial file usually fails at this stage rather than at the embassy, which is why it is often never described as a refusal at all.",
      },
      {
        title: "A sponsor whose income does not match the amount",
        body:
          "Japanese applications ask for the sponsor's occupation, income and relationship in detail, with documents behind each. A balance that a sponsor's declared income could not plausibly have produced is the most common problem on Nepali files here.",
      },
      {
        title: "Japanese language level not matching the programme",
        body:
          "Language schools and degree programmes want different things, and applying to a degree taught in Japanese without a level of Japanese to match invites an obvious question. If you are going via a language school first, say so plainly and show how the two steps connect.",
      },
      {
        title: "Starting too late for the Certificate of Eligibility",
        body:
          "The Certificate of Eligibility takes months, and it happens before the visa rather than after it. An application started at the timescale that works for Australia will miss a Japanese intake entirely.",
      },
    ],
    timeline: [
      { when: "12 months before", what: "Choose the school, and the route", detail: "Language school first, or straight into a degree. This decides everything downstream and is hard to change later." },
      { when: "10 months before", what: "Apply to the school", detail: "The school, not you, applies for the Certificate of Eligibility, so their deadlines are the real deadlines." },
      { when: "8 to 9 months before", what: "Submit the financial documents to the school", detail: "Sponsor's income, relationship, bank evidence and the source of the funds. The school reviews these before forwarding anything." },
      { when: "5 to 7 months before", what: "The Certificate of Eligibility is processed", detail: "This is the long wait, and it is out of your hands. Nothing else can proceed until it is issued." },
      { when: "3 months before", what: "The NOC, and the visa application", detail: "With the Certificate of Eligibility in hand, apply for the visa at the embassy. Apply for Nepal's NOC in parallel." },
      { when: "1 to 2 months before", what: "Housing and arrival", detail: "Japanese housing usually requires a guarantor and payment up front, and it is the cost most students underestimate." },
    ],
    faq: [
      { q: "How much money do I need for a Japanese student visa?", a: "There is no published national figure. Japan requires that you can cover tuition and living costs for the whole programme, and each school applies that as its own threshold. Schools commonly ask to see around two million yen for a one year programme, but ask your school what it requires rather than relying on a general figure." },
      { q: "What is a Certificate of Eligibility?", a: "A document your school obtains from Japan's immigration bureau confirming you meet the conditions for student residence status. It is granted before the visa, and the visa application at the embassy is comparatively simple once you hold one." },
      { q: "Can I apply for the visa myself without a school?", a: "No. The Certificate of Eligibility is applied for by the school on your behalf, which is why the school's admission process and its deadlines govern the whole timeline." },
      { q: "Do I need to speak Japanese?", a: "It depends entirely on the programme. Degrees taught in English exist and are growing, but most routes from Nepal go through a language school first, and the application should explain that path rather than leave it implied." },
      { q: "Can I work while studying in Japan?", a: "Students may apply for permission to engage in limited part-time work, within a weekly cap. It is not accepted as part of the funds you must demonstrate, and the application explicitly tests whether you could study without relying on it." },
      { q: "Do I need an NOC?", a: "Yes. The No Objection Certificate from Nepal's Ministry of Education is what allows your bank to remit tuition legally, and it is separate from anything Japan requires." },
    ],
    related: [
      { href: "/blog/noc-for-abroad-study-nepal", label: "The NOC, start to finish" },
      { href: "/tools/compare", label: "Compare destinations side by side" },
      { href: "/blog/sop-mistakes-that-get-nepali-students-refused", label: "The sentences that sink a statement" },
    ],
  },
  {
    slug: "south-korea",
    standalone: { name: "South Korea", flag: "🇰🇷", visa: "D-2 student visa" },
    h1: "Studying in South Korea from Nepal",
    metaTitle: "Study in South Korea from Nepal: cost, D-2 visa and funds",
    metaDescription:
      "What South Korea asks a Nepali student to show financially, the difference between a D-2 and a D-4, and why the university screens the file first.",
    opening:
      "Korea splits its student visas in a way that matters more than most students realise. A D-2 is for a degree at a university; a D-4 is for a language course or a non-degree programme, and the two carry different conditions and different work rights. The university verifies your finances before immigration does, because Korean law requires it to, so the institution is the first real check on your application.",
    funds: {
      headline: "No single government figure",
      sub: "universities set the amount, and Seoul institutions set it higher",
      formula:
        "Korea does not publish one national threshold. Universities are required to verify that an applicant can cover the full cost of the first year and to confirm funding for subsequent years, and they translate that into their own requirement. Institutions in the Seoul metropolitan area commonly ask for the equivalent of around twenty million won, and others less.",
      source:
        "Korean immigration requires the university to verify funds; each university publishes its own amount",
      holding:
        "A bank balance certificate is normally required in your own name and dated within about a month of the application, with statements from the preceding three months. Where the source of the money is unclear or it is borrowed, the review becomes markedly stricter.",
      checkedOn: "2026-10-01",
    },
    refusals: [
      {
        title: "Applying for the wrong visa category",
        body:
          "A D-2 is a degree at a university. A D-4 is a language or non-degree course. Students routinely apply for one while describing the other, and the conditions, the work rights and the path afterwards all differ. Get the category right before anything else.",
      },
      {
        title: "A balance certificate in someone else's name",
        body:
          "Korean universities generally want the certificate in the applicant's own name, dated recently. A parent's account, or a figure assembled and certified the week before, is where Nepali files most often stall, and it stalls at the university rather than at immigration.",
      },
      {
        title: "A study plan that does not explain Korea",
        body:
          "The study plan is read, and it is read for whether Korea specifically makes sense for you rather than as a general statement about wanting to study abroad. A plan that would read identically with the country name changed is the pattern that gets doubted.",
      },
      {
        title: "Documents not legalised or translated properly",
        body:
          "Academic and financial documents from Nepal usually need apostille or consular legalisation and certified translation. This takes weeks, is commonly left until after the offer, and is the single most avoidable delay on a Korean application.",
      },
    ],
    timeline: [
      { when: "10 to 12 months before", what: "Decide D-2 or D-4, and shortlist", detail: "Degree or language course. Everything else follows from this, including which documents you will need." },
      { when: "8 to 10 months before", what: "Start document legalisation", detail: "Apostille or consular legalisation and certified translation of academic and financial documents. Start this before you apply, not after you are accepted." },
      { when: "7 months before", what: "Apply to universities", detail: "Korean intakes are usually March and September, and the application windows are narrow." },
      { when: "5 months before", what: "Accept, and prepare the balance certificate", detail: "In your own name, dated close to the application. Work out the university's exact requirement rather than a general figure." },
      { when: "3 to 4 months before", what: "The NOC, and the visa application", detail: "The university issues a certificate of admission, which the visa application needs. Apply for Nepal's NOC alongside." },
      { when: "1 to 2 months before", what: "Housing and the alien registration plan", detail: "You register after arrival, within a set period. Know the deadline before you land rather than after." },
    ],
    faq: [
      { q: "How much money do I need for a Korean student visa?", a: "There is no single government threshold. Korean law requires the university to verify that you can cover the first year in full, and each university sets its own figure. Institutions in the Seoul metropolitan area commonly ask for the equivalent of around twenty million won. Ask the specific university rather than relying on a general number." },
      { q: "What is the difference between D-2 and D-4?", a: "D-2 is for a degree programme at a university. D-4 is for a language course or other non-degree study. The conditions, the work rights and what you can do afterwards all differ, so applying in the wrong category causes real problems." },
      { q: "Does the bank certificate have to be in my name?", a: "Universities generally want it in the applicant's own name and dated recently, often within about a month of the application, with supporting statements from the preceding months." },
      { q: "Do my documents need to be legalised?", a: "Usually yes, by apostille or consular legalisation, with certified translation. It takes weeks and should be started before you are accepted rather than after." },
      { q: "Can I work while studying in Korea?", a: "Part-time work is permitted within limits and usually requires permission and a minimum period of study first, and the conditions differ between D-2 and D-4. It is not counted towards the funds you must show." },
      { q: "Do I need an NOC?", a: "Yes. Nepal's No Objection Certificate is what allows your bank to remit tuition legally, and it is separate from anything Korea requires." },
    ],
    related: [
      { href: "/blog/noc-for-abroad-study-nepal", label: "The NOC, start to finish" },
      { href: "/tools/compare", label: "Compare destinations side by side" },
      { href: "/blog/student-visa-refused-nepal-what-to-do-next", label: "Refused. What now?" },
    ],
  },
  {
    slug: "finland",
    standalone: { name: "Finland", flag: "🇫🇮", visa: "Residence permit for studies" },
    h1: "Studying in Finland from Nepal",
    metaTitle: "Study in Finland from Nepal: cost, residence permit and funds",
    metaDescription:
      "Finland publishes an exact figure a student must hold, and will not accept a sponsor's guarantee or a shared account. What that means for a Nepali application.",
    opening:
      "Finland is the strictest of these destinations in one specific way, and it catches Nepali families out because it runs against how every other application here is built. The money has to be in the student's own account. Not a parent's, not a joint account, and a sponsorship guarantee is not accepted in place of it. An application assembled the way a UK or Australian one is assembled will fail on that point alone.",
    funds: {
      headline: "EUR 9,600",
      sub: "in the student's own account when the application is submitted",
      formula:
        "At least EUR 800 a month at your disposal, which for studies lasting a year or longer means EUR 9,600 in the bank account when you submit the application. Where the institution provides support towards your living costs, less may be required, and that support has to be documented with the application.",
      source: "Finnish Immigration Service (Migri) income requirement for students",
      holding:
        "The account must be in your own name. Shared accounts and sponsorship guarantees are not accepted, which is the opposite of how most applications from Nepal are put together. Migri asks for a bank statement covering the preceding six months, so the money has to be in your account well before you apply.",
      checkedOn: "2026-10-01",
    },
    refusals: [
      {
        title: "The money in a parent's or a joint account",
        body:
          "This is the one that fails Nepali applications most often, because a sponsor's account is the normal way a file is built for the UK, Australia or Canada. Finland does not accept it. The funds must sit in the student's own account, so the transfer has to happen early enough to be visible in the statements.",
      },
      {
        title: "Treating a sponsorship letter as evidence",
        body:
          "A letter promising support, however well drafted and however genuine, does not substitute for the balance. If a relative is funding you, the money needs to move into your account and be shown there.",
      },
      {
        title: "Insurance that does not meet the requirement",
        body:
          "Finland requires health insurance with a specified minimum cover, and the level depends on the length of your studies. A general travel policy bought cheaply usually does not meet it, and this is discovered at the point of application rather than before.",
      },
      {
        title: "Applying too late for the permit processing time",
        body:
          "A residence permit is not a visa sticker issued in days. Processing takes time, biometrics must be given, and the permit card is collected. Students used to a visa timeline apply too late and miss the intake even though the application itself was sound.",
      },
    ],
    timeline: [
      { when: "12 months before", what: "Shortlist, and check the language of instruction", detail: "Finland teaches many degrees in English, particularly at masters level, but not all of them. Confirm per programme." },
      { when: "10 months before", what: "Apply", detail: "Finnish application periods are narrow and often early in the year for an autumn intake. Missing one means waiting a full year." },
      { when: "8 months before", what: "Move the money into your own account", detail: "This is the step that decides the application. Start it early enough that the account shows a settled balance in your own name rather than a recent transfer." },
      { when: "6 months before", what: "Accept the place, pay any tuition deposit", detail: "Tuition fees apply to non-EU students at most institutions, with scholarships commonly available and worth applying for separately." },
      { when: "4 to 5 months before", what: "Apply for the residence permit, arrange insurance", detail: "Check the required level of health cover before buying a policy. Apply for Nepal's NOC alongside." },
      { when: "2 to 3 months before", what: "Biometrics and the permit card", detail: "Biometrics are given at the mission, and the card follows. Build in more time than a visa would need." },
    ],
    faq: [
      { q: "How much money do I need for a Finnish student residence permit?", a: "At least EUR 800 a month, which for studies of a year or longer means EUR 9,600 in your bank account when you submit the application. Check the current figure with the Finnish Immigration Service, because it is reviewed." },
      { q: "Can my parents hold the money for me?", a: "No. The account must be in your own name. Finland does not accept shared accounts or a sponsorship guarantee in place of the balance, which is the single biggest difference from a UK or Australian application." },
      { q: "Is studying in Finland free?", a: "Not for students from outside the EU and EEA at most institutions, where tuition fees apply. Scholarships are common and are usually applied for alongside admission rather than afterwards." },
      { q: "Is it a visa or a residence permit?", a: "A residence permit, which is a different process from a visa and takes longer. Biometrics are given and a permit card is issued, so the timeline needs more room than a visa would." },
      { q: "What insurance do I need?", a: "Health insurance meeting a specified minimum level of cover, which depends on the length of your studies. Check the requirement before buying a policy; a basic travel policy often does not qualify." },
      { q: "Do I need an NOC?", a: "Yes. Nepal's No Objection Certificate is what allows your bank to remit tuition legally, and it is separate from anything Finland requires." },
    ],
    related: [
      { href: "/blog/noc-for-abroad-study-nepal", label: "The NOC, start to finish" },
      { href: "/tools/compare", label: "Compare destinations side by side" },
      { href: "/tools/scholarships", label: "Find a scholarship" },
    ],
  },
  {
    code: "IE",
    slug: "ireland",
    h1: "Studying in Ireland from Nepal",
    metaTitle: "Study in Ireland from Nepal: cost, visa and funds",
    metaDescription:
      "What studying in Ireland costs from Nepal, the €10,000 funds figure the embassy asks you to show, and why spread finances get files refused.",
    opening:
      "There is no Irish embassy in Kathmandu, and that shapes the whole application: a Nepali student's visa is processed by the New Delhi Visa Office, part of the Irish Embassy in India, over an online portal called AVATS. Ireland's own one year masters keeps the total cost close to the UK's. What is different, and what the embassy is unusually blunt about in its own guidance, is how strict it is about where the money sits and how tidily it can be traced, rather than simply how much of it there is.",
    refusals: [
      {
        title: "Applying before the offer is unconditional",
        body:
          "The New Delhi Visa Office only processes applications from students holding an unconditional offer to study an eligible course. A conditional offer, common while a final transcript or an English score is still pending, is not enough to submit. Wait until every condition on the offer letter is cleared before creating the AVATS application, rather than assuming the visa office will take it provisionally.",
      },
      {
        title: "Finances spread across too many accounts and sponsors",
        body:
          "The embassy's own guidance says plainly that spreading finances across multiple sponsors and multiple holdings increases the risk of refusal, because the evidence becomes harder to read as one coherent picture. Six months of the applicant's own bank statements and six months of any sponsor's are asked for. Consolidating into as few accounts as genuinely possible before that window starts is worth more than the same money spread across five.",
      },
      {
        title: "A loan sanction letter with nothing behind it",
        body:
          "A bank's sanction letter is treated as a starting point, not proof of a loan. Where property secures it, the deeds have to be submitted. Where the source of funds is the sale of land or a house, the sale itself needs documentary evidence, and the loan amount has to be realistic against the guarantor's existing income, not an income rise that has not happened yet.",
      },
      {
        title: "No English test submitted with the visa application",
        body:
          "Submitting an approved English language test is compulsory for every Irish study visa application, separate from whatever the university itself required for admission. The embassy states outright that failing to submit one results in refusal. A student admitted on an institutional waiver still needs a test result in the visa file.",
      },
    ],
    timeline: [
      {
        when: "10 to 12 months before",
        what: "Sit IELTS or PTE, and shortlist",
        detail:
          "An approved English test is compulsory for the visa itself, not only for admission, so book one even if a university would waive it. Confirm which test your course accepts.",
      },
      {
        when: "8 to 9 months before",
        what: "Apply, and wait for an unconditional offer",
        detail:
          "The New Delhi Visa Office will not process an application against a conditional offer. Chase the university until every condition, usually the final transcript and the English score, is cleared.",
      },
      {
        when: "6 to 7 months before",
        what: "Consolidate finances into one or two accounts",
        detail:
          "Move money out of scattered holdings now. The six months of statements the embassy asks for have to show a settled position, not a transfer that arrived the week before you apply.",
      },
      {
        when: "5 months before",
        what: "Submit the AVATS application",
        detail:
          "Five months before the course start is the earliest the New Delhi Visa Office accepts an application, and it recommends applying as soon as the offer and supporting documents are ready rather than waiting.",
      },
      {
        when: "4 months before",
        what: "Pay the fees, book VFS, and get the NOC",
        detail:
          "Course fees of up to €6,000 must be paid in full before the visa application; above that, at least €6,000 must be paid. Nepal's own NOC from the Ministry of Education runs alongside, and is what lets your bank remit the rest.",
      },
      {
        when: "On arrival",
        what: "Register within 90 days for Stamp 2 permission",
        detail:
          "Every non-EEA student, visa-required or not, has to register with the immigration authorities to stay beyond 90 days. Registering is what gives you Stamp 2 permission and the right to work part time during term.",
      },
    ],
    faq: [
      {
        q: "How much money do I need to show for an Irish student visa?",
        a: "€10,000 for a course of a year or longer, or €6,665 for an eight month course and €4,998 for six months, on top of your first year's tuition. This is the published cost of living threshold rather than an estimate, so check the current figure on the Irish immigration website before you rely on it.",
      },
      {
        q: "Do I need to submit an English test for the visa itself?",
        a: "Yes. The embassy requires an approved English language test with every study visa application regardless of what the university asked for at admission, and states that not submitting one results in refusal.",
      },
      {
        q: "Can my sponsor's money be spread across several accounts?",
        a: "It is safer not to. The embassy's own guidance says spreading finances across multiple sponsors and multiple holdings increases the risk of refusal, because the evidence becomes harder to read clearly. Consolidate into as few accounts as genuinely possible before the six month statement window starts.",
      },
      {
        q: "Do I need an NOC to study in Ireland?",
        a: "Yes. The No Objection Certificate from Nepal's Ministry of Education is what allows your bank to legally remit tuition abroad. It is a Nepali requirement, separate from anything the Irish visa asks for.",
      },
      {
        q: "Can I work while studying in Ireland?",
        a: "Once you hold Stamp 2 permission you can work up to 20 hours a week during term and up to 40 hours a week during the standardised holiday periods. Stamp 2A, given for some non-degree courses, does not carry the right to work at all, so check which stamp your course leads to before counting on the income.",
      },
      {
        q: "Can I stay and work after I graduate?",
        a: "The Third Level Graduate Scheme lets some graduates work in Ireland for up to two years without needing a separate employment permit. Whether your course qualifies depends on its level, so confirm it with your institution before relying on the pathway.",
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
