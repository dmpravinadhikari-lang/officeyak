import type { IconName } from "@/components/Icon";

/**
 * The software landing pages.
 *
 * One page per part of the product, not one page per keyword. The queue in
 * docs/seo/keyword-queue.md listed eight, and several of them are the same
 * question asked twice: "education consultancy crm", "crm for education
 * consultancy" and "best crm for education consultancy" are one intent, and a
 * separate page for each would be three thin pages competing with each other
 * for a total of maybe two hundred searches a month.
 *
 * So each page here covers a cluster, and `keywords` records which. That list
 * is not for stuffing into the copy. It is there so the next person can see
 * what a page is meant to answer and judge whether it does.
 *
 * Everything claimed on these pages has to be something the product actually
 * does today. A landing page that promises a feature is a refund request with
 * better typography.
 */

export type Capability = { icon: IconName; title: string; body: string };
export type Faq = { q: string; a: string };

export type SoftwarePage = {
  slug: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  /** What this page is meant to rank for. Recorded, never stuffed. */
  keywords: string[];
  /** The eyebrow above the h1. */
  eyebrow: string;
  /** The short name for the breadcrumb and its schema. The h1 is too long. */
  crumb: string;
  /** One paragraph, before anything else, naming the problem honestly. */
  opening: string;
  /** The situation the reader is actually in, before any feature is mentioned. */
  problem: { title: string; body: string };
  capabilities: Capability[];
  /** A real screenshot from public/product, with what it shows. */
  shot: { src: string; alt: string; caption: string };
  /** Why this is different for a consultancy in Nepal specifically. */
  local: { title: string; body: string };
  faq: Faq[];
  related: { href: string; label: string }[];
};

export const SOFTWARE_PAGES: SoftwarePage[] = [
  {
    slug: "education-consultancy-crm",
    eyebrow: "The whole consultancy",
    crumb: "Consultancy CRM",
    h1: "A CRM built for an education consultancy",
    metaTitle: "Education Consultancy CRM: one system for the whole office",
    metaDescription:
      "Leads, students, documents, attendance and payroll in one system, built for Nepali consultancies rather than adapted from a sales CRM.",
    keywords: [
      "education consultancy crm",
      "crm for education consultancy",
      "best crm for education consultancy",
      "consultancy management system",
      "best consultancy management system",
    ],
    opening:
      "Most consultancies do not choose software. They outgrow spreadsheets and pick whatever gets demonstrated first, which is usually a sales CRM built for closing deals in three weeks, then bent into a shape it was not designed for. A student file is not a deal. It runs for a year, changes destination halfway through, carries documents that expire, and involves a parent who is paying but is not the applicant.",
    problem: {
      title: "The spreadsheet does not break, it just quietly stops working",
      body:
        "Somewhere around thirty active students, or the second person who needs to edit the same file, things start being missed. Two counsellors have slightly different versions and nobody is sure which is current. A follow up on a sheet nobody opened this week does not happen. The owner asks how many students are at offer stage and the honest answer is that it would take an afternoon to find out. None of that looks like failure. It looks like a busy office, which is what makes it expensive.",
    },
    capabilities: [
      {
        icon: "clock",
        title: "Every enquiry has a next action with a date on it",
        body:
          "Not a note saying follow up. A specific thing, on a specific day, visible to the whole office rather than to the counsellor who wrote it. The home screen opens on what is overdue, so a promise made on Sunday is not discovered three weeks later.",
      },
      {
        icon: "chart",
        title: "A stage per student, and a figure per stage",
        body:
          "Enquiry, counselling, test preparation, applying, offer, visa, departed. The board shows how many sit at each, so the question an owner actually asks has an answer in one screen instead of an afternoon of counting.",
      },
      {
        icon: "lock",
        title: "Documents sealed on disk, not in a shared folder",
        body:
          "Passports and bank statements are encrypted before they touch the server, so a stolen backup is ciphertext. Who opened what is recorded, and sensitive papers are given an expiry so they are not still sitting there two years after the student departed.",
      },
      {
        icon: "people",
        title: "Eleven positions, not two",
        body:
          "A receptionist writes enquiries and cannot open a bank letter. A counsellor works their own students and never sees what an institution pays. Permissions follow the job someone actually does, and the server checks them on every screen rather than hiding a link.",
      },
      {
        icon: "building",
        title: "Head office sees every branch without asking anyone",
        body:
          "A branch sees its own students. Head office sees all of them, side by side, from the same place. The moment a report has to be requested it becomes a negotiation, so there is nothing to request.",
      },
      {
        icon: "wallet",
        title: "The money, in both directions",
        body:
          "What each institution owes you for the students you placed, whether it has been invoiced and whether it has arrived. And separately what each family owes you, itemised so a government fee is never bundled with a service fee.",
      },
    ],
    shot: {
      src: "/product/console.png",
      alt: "The OfficeYak console showing missed follow-ups, open enquiries and who is in today",
      caption:
        "The home screen opens on what is overdue rather than on a chart. Thirty missed follow-ups is a number somebody can act on this morning.",
    },
    local: {
      title: "Built in Nepal, for the way the work actually runs",
      body:
        "Payroll runs in the Nepali month, not a calendar one, and reads the days actually clocked. Dates are Bikram Sambat as well as Gregorian. Costs are in rupees, with the visa funds requirement for each destination quoted from its own government source. Attendance knows that your Pokhara branch is in Pokhara. None of this is a setting somebody has to find.",
    },
    faq: [
      {
        q: "How is this different from a normal CRM?",
        a: "A sales CRM models an opportunity that opens, progresses and closes in weeks. A student file runs for a year or more, changes destination partway, carries documents that expire, and involves a parent who is paying but is not the applicant. You can build that in custom fields, and offices that do spend six months configuring software and still cannot say who was promised a call this week.",
      },
      {
        q: "Do we pay per counsellor?",
        a: "No. Staff accounts are unlimited on every plan. Charging per seat makes an owner ration logins, and a counsellor without a login writes on paper, and the paper is not in the system.",
      },
      {
        q: "Can we try it before paying?",
        a: "Yes. There is a free tier, you set up your own subdomain, and nothing is charged until you ask to be invoiced. There is no card on file.",
      },
      {
        q: "What happens to our data if we leave?",
        a: "You can export it. Ask and we send it. A system you cannot leave is one that stops having to earn you, which is a bad arrangement for both of us.",
      },
      {
        q: "Can a counsellor see what an institution pays us?",
        a: "No. Commission rates and what is owed sit behind a separate permission that counsellors do not have by default. A counsellor who knows which institution pays best has been given a reason to recommend it.",
      },
      {
        q: "Does it work on a phone?",
        a: "Yes, and it is built phone first rather than squeezed down from a desktop layout. Most broadband connections in Nepal are mobile, so the desktop sidebar is the special case rather than the default.",
      },
    ],
    related: [
      { href: "/software/enquiry-management-software", label: "Enquiry and lead management" },
      { href: "/software/attendance-management-system", label: "Staff attendance and payroll" },
      { href: "/blog/education-consultancy-software-what-matters", label: "Choosing software for a consultancy" },
    ],
  },

  {
    slug: "enquiry-management-software",
    eyebrow: "Before they are a student",
    crumb: "Enquiry management",
    h1: "Enquiry and lead management for a consultancy",
    metaTitle: "Enquiry Management Software for Education Consultancies",
    metaDescription:
      "Every walk-in, call and form in one list, with a dated next action on each, so the enquiry nobody called back stops being the most expensive thing in the office.",
    keywords: [
      "enquiry management software",
      "lead management system",
      "lead tracking crm",
      "crm lead management system",
      "student lead management",
    ],
    opening:
      "Ask an owner why a student did not enrol and you will usually hear that they went somewhere cheaper. Look at the files and a different pattern appears. The student came in, was interested, was promised a call, and the call came a week later or not at all. They did not choose a competitor. They were never given a reason to choose you.",
    problem: {
      title: "The gap between the first conversation and the second",
      body:
        "It is almost never the first conversation that fails, because the person is standing in front of you. A student asks about Australia in Asar and needs an IELTS result, so there is nothing to do for six weeks. The counsellor makes a mental note. Three weeks later that counsellor is deep in an intake deadline for four other students. The result arrives and nobody knows, because nobody was watching for it. In Mangsir the student walks past a different office and someone there asks them a question.",
    },
    capabilities: [
      {
        icon: "inbox",
        title: "A reception form that needs no login",
        body:
          "Put it on a tablet at the front desk. A name and a number is enough to open an enquiry, and it lands on the board the moment they press done, so a walk-in is recorded while they are still in the room rather than from memory that evening.",
      },
      {
        icon: "clock",
        title: "A next action, with a date, on every enquiry",
        body:
          "Not a status. A specific thing on a specific day. The overdue list is the first thing the office sees each morning, which is how a promise made three weeks ago gets kept.",
      },
      {
        icon: "user",
        title: "Nobody owns nothing",
        body:
          "An unassigned enquiry is visible as unassigned, because an unowned file moves slowest. One press hands a list to a counsellor, and the board shows who is carrying too much before they resign rather than after.",
      },
      {
        icon: "chart",
        title: "Where the enquiry came from, and what happened to it",
        body:
          "Walk-in, referral, Facebook, the form. Reports show which channel actually produces students rather than which produces enquiries, which are very different numbers and only one of them is worth spending money on.",
      },
      {
        icon: "spark",
        title: "Automatic follow-up that does not read as automatic",
        body:
          "Queued emails go out on the schedule you set, and hold during quiet hours so nobody is messaged at eleven at night. Invitations and password resets are the exception and go immediately, because a student told to check their email should find it there.",
      },
      {
        icon: "students",
        title: "The enquiry becomes the student",
        body:
          "When they enrol, nothing is retyped. The enquiry, its history and its documents become the student file, so the conversation from the first day is still there at the visa stage.",
      },
    ],
    shot: {
      src: "/product/students.png",
      alt: "The student board filtered by office, showing stage, destination and next step for each student",
      caption:
        "Filter to one office, or to the follow-ups already past their date, then hand the list to a counsellor in one press.",
    },
    local: {
      title: "The numbers that actually tell you something",
      body:
        "Not how many enquiries you have. How long between somebody leaving their number and somebody calling it, how many files have had no activity in three weeks, and how the stages are distributed. An office with thirty enquiries and nobody past counselling has a counselling problem, not a lead problem, and the difference is invisible until something counts it.",
    },
    faq: [
      {
        q: "How quickly should a walk-in be followed up?",
        a: "The same day, even if the answer is only that you will have the information tomorrow. The purpose of the first contact is not to answer the question, it is to establish that this office replies.",
      },
      {
        q: "Can counsellors keep their own lists?",
        a: "They can, and it is the single most expensive habit to keep. When that counsellor leaves, resigns or takes leave, their list leaves with them. Everything here is visible to the office, which is what makes a resignation an inconvenience rather than an emergency.",
      },
      {
        q: "Does it send messages on WhatsApp or Viber?",
        a: "Email is what the system sends. Most of the real conversation happens on a personal phone, and the practical answer is that anything consequential gets written into the student's file at the time, so whoever is in the office tomorrow can pick it up.",
      },
      {
        q: "Can we import enquiries we already have?",
        a: "Yes. Send us your sheet and we will load it, rather than asking a counsellor to retype three hundred rows.",
      },
      {
        q: "What counts as an enquiry?",
        a: "Whatever you decide, but it has to be the same decision in every branch. Two offices counting differently is how a comparison between them becomes guesswork.",
      },
    ],
    related: [
      { href: "/software/education-consultancy-crm", label: "The whole consultancy in one system" },
      { href: "/blog/why-student-leads-go-quiet", label: "Why enquiries go quiet" },
      { href: "/blog/hiring-paying-counsellors-nepal", label: "Hiring and paying counsellors" },
    ],
  },

  {
    slug: "attendance-management-system",
    eyebrow: "Staff",
    crumb: "Staff attendance",
    h1: "An attendance management system with a geofence",
    metaTitle: "Attendance Management System for Offices in Nepal",
    metaDescription:
      "Staff clock in from inside the office, not from the bus. Attendance feeds payroll in the Nepali month, and away days carry a reason.",
    keywords: [
      "attendance management system",
      "online attendance management system",
      "online attendance system",
      "cloud based attendance system",
      "employee attendance management system",
      "staff attendance software",
      "automated attendance system",
      "time and attendance management system",
      "attendance and payroll software",
      "free attendance management system",
    ],
    opening:
      "Most attendance software answers the wrong question. It records that somebody pressed a button, which tells you nothing, because the button can be pressed from anywhere. The question worth answering is whether the person was at work, and the only honest way to answer it is to check where the phone was when they said they arrived.",
    problem: {
      title: "A register that everybody knows is fiction",
      body:
        "A paper register signed at the end of the week is filled in from memory and rounded generously. A punch app without a location is pressed on the bus. Either way the figures that reach payroll are wrong, and everybody in the office knows they are wrong, which is worse than not measuring at all because it makes the honest staff feel foolish.",
    },
    capabilities: [
      {
        icon: "pin",
        title: "Clocking in from inside a radius you set",
        body:
          "Pin each office on a map and set how far out still counts. A clock-in from outside that radius is recorded as outside it, with the distance, rather than silently accepted or silently refused.",
      },
      {
        icon: "calendar",
        title: "An away day carries a reason",
        body:
          "Staff are legitimately out: a university visit, an education fair, a bank. Clocking in from elsewhere is allowed and asks why, so the record shows a reason rather than a gap that gets argued about at month end.",
      },
      {
        icon: "coins",
        title: "Attendance feeds payroll, in the Nepali month",
        body:
          "Payroll runs on the Nepali month because that is the month salaries are actually paid in, and it reads the days genuinely clocked rather than a figure typed in afterwards. SSF, PF, TDS and CIT are handled.",
      },
      {
        icon: "ticket",
        title: "A front desk clock for shared devices",
        body:
          "Not everyone carries a phone they will install something on. A tablet at reception, a PIN each, and the same record.",
      },
      {
        icon: "people",
        title: "Who is in today, per office",
        body:
          "The home screen shows who has clocked in and who has not, per branch. Head office sees every branch at once without asking a manager to send anything.",
      },
      {
        icon: "lock",
        title: "Salaries stay out of the CRM",
        body:
          "The staff list shows a band, not a figure. Exact salaries sit behind payroll's own permission, and opening payroll is recorded. Nothing in the system deletes that trail.",
      },
    ],
    shot: {
      src: "/product/attendance.png",
      alt: "The attendance register showing days in, hours, and who clocked in from away",
      caption:
        "This month, by person: days in, hours, and which ones were clocked from outside the office radius.",
    },
    local: {
      title: "Why the Nepali month matters",
      body:
        "Attendance software built elsewhere runs on calendar months, so a Nepali payroll built on it is either wrong or maintained by hand in a spreadsheet beside it. Asar is not July. Running the month the salary is actually paid in removes a reconciliation nobody should be doing.",
    },
    faq: [
      {
        q: "Can staff clock in from home?",
        a: "They can press the button anywhere, and the record will say where they were. A clock-in from outside the radius you set is recorded as outside it, with the distance, and asks for a reason. Nothing is silently accepted.",
      },
      {
        q: "Does it work without a smartphone for every member of staff?",
        a: "Yes. There is a front desk clock for a shared tablet, where each person has a PIN. The record is the same.",
      },
      {
        q: "Is there a free version?",
        a: "There is a free tier that includes attendance with a geofence, so you can run a real office on it before paying anything. Nothing is charged until you ask to be invoiced.",
      },
      {
        q: "Does attendance connect to payroll?",
        a: "Yes. Payroll reads the days actually clocked rather than a number retyped from a register, and it runs on the Nepali month.",
      },
      {
        q: "What if somebody is genuinely out of the office?",
        a: "They clock in and give a reason, which is recorded against the day. A university visit is not absence, and a system that cannot tell the difference produces figures nobody trusts.",
      },
      {
        q: "Can a branch manager see only their own office?",
        a: "Yes. How far somebody sees is set separately from what they can do, so a branch manager sees their office and head office sees all of them.",
      },
    ],
    related: [
      { href: "/software/student-attendance-management-system", label: "Class registers for students" },
      { href: "/software/education-consultancy-crm", label: "The whole consultancy in one system" },
      { href: "/blog/running-multiple-branches-consultancy", label: "Opening a second branch" },
    ],
  },

  {
    slug: "student-attendance-management-system",
    eyebrow: "Students and classes",
    crumb: "Student attendance",
    h1: "A student attendance management system for classes",
    metaTitle: "Student Attendance Management System for Test Prep Classes",
    metaDescription:
      "Class registers that take a minute, attendance per student per date, and a record that says who marked it, alongside the rest of the student's file.",
    keywords: [
      "student attendance management system",
      "student attendance software",
      "student attendance tracking software",
      "class attendance system",
    ],
    opening:
      "A consultancy running IELTS and PTE classes has a second attendance problem that has nothing to do with staff. Students pay for a course and then stop coming, and the person who notices is usually the instructor, informally, weeks later. By then the student has paid for a class they have not attended and is about to blame the consultancy for a score.",
    problem: {
      title: "The register that lives in the instructor's notebook",
      body:
        "Classes get marked on paper, or not at all, and the sheet stays with whoever taught that day. Nobody joins it up to the student's file, so a counsellor preparing that student for an application has no idea they attended four of the last twelve sessions. The conversation that should have happened in week three happens after the test.",
    },
    capabilities: [
      {
        icon: "checklist",
        title: "A register that takes under a minute",
        body:
          "The class, the date, the enrolled students, present or not. Marked on a phone at the start of the session rather than written up afterwards, which is the difference between a register that is kept and one that is reconstructed.",
      },
      {
        icon: "students",
        title: "Enrolment is a list, not a memory",
        body:
          "Who is in which class, from when. A student who joins a batch late or moves between batches is recorded as having done so, so the attendance figure means something.",
      },
      {
        icon: "folder",
        title: "Attendance sits on the student's file",
        body:
          "The counsellor working that student's application sees the classes alongside the mock scores, the documents and the next action, because those facts belong together and are useless apart.",
      },
      {
        icon: "pen",
        title: "Who marked it, and when",
        body:
          "Every mark carries the person who made it and the time. Not to police instructors, but so a disputed month has an answer rather than two recollections.",
      },
      {
        icon: "file",
        title: "A note where present or absent is not the whole story",
        body:
          "Arrived late, left early, sat the mock instead. A register with two states produces arguments; one that lets somebody write a line does not.",
      },
    ],
    shot: {
      src: "/product/students.png",
      alt: "The student board showing each student's stage, destination and next step",
      caption:
        "Class attendance sits on the same file as the mock scores and the documents, because a counsellor needs all three at once.",
    },
    local: {
      title: "Test preparation is a separate business inside the consultancy",
      body:
        "Most consultancies in Nepal run classes as well as applications, often with different staff on a different rhythm, and the two halves rarely see each other. A student failing to attend is the earliest signal that a file is about to stall, and it is the signal most likely to be missed because it lives in a different room.",
    },
    faq: [
      {
        q: "Is this the same as staff attendance?",
        a: "No, and they are deliberately separate. Staff clock in and out with a location check. Students are marked present in a class by whoever is teaching it. Different questions, different records.",
      },
      {
        q: "Can an instructor mark the register from a phone?",
        a: "Yes. It is built phone first, which matters because a register marked at the start of the class is accurate and one written up that evening is not.",
      },
      {
        q: "Can we see attendance next to a student's mock test scores?",
        a: "Yes. It is on the same student file as the mocks, the documents and the application, which is the point. Attendance falling before a score falls is the useful pattern and it is invisible if the two live apart.",
      },
      {
        q: "What if a student moves between batches?",
        a: "Enrolment records when somebody joined a class, so their attendance percentage is calculated against the sessions they were actually enrolled for.",
      },
      {
        q: "Can parents see attendance?",
        a: "Parents get a read-only progress link rather than an account, and what it shows is deliberately limited. They see progress and what is outstanding, not documents or transcripts.",
      },
    ],
    related: [
      { href: "/software/attendance-management-system", label: "Staff attendance with a geofence" },
      { href: "/software/education-consultancy-crm", label: "The whole consultancy in one system" },
      { href: "/tools", label: "Free tools your students can use" },
    ],
  },
];

export const softwareSlugs = () => SOFTWARE_PAGES.map((p) => p.slug);
export const softwareBySlug = (slug: string) =>
  SOFTWARE_PAGES.find((p) => p.slug === slug) ?? null;
