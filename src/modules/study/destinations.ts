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
];

export const destinationSlugs = () => DESTINATIONS.map((d) => d.slug);
export const destinationBySlug = (slug: string) =>
  DESTINATIONS.find((d) => d.slug === slug) ?? null;
