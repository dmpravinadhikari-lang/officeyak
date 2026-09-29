# The keyword queue

This file is the daily SEO routine's instruction sheet. Edit it and the
routine follows it the next morning. Move a line up to write that guide
sooner; delete a line to drop it; add one and it joins the queue.

Every keyword below came from real search data for Nepal. Two things about
that data are worth keeping in mind, because they decide the whole strategy.

**The volumes are small.** Almost everything here is 10 to 100 searches a
month, and several are 0 to 10. Winning all twenty of these might produce
somewhere between five hundred and fifteen hundred visits a month, of which a
handful convert. That is worth having and it is not a business on its own.

**The competition is small too.** "Low" difficulty on a term like "education
consultancy crm" means almost nobody has written a serious page for it. A
small number of searches that nobody is competing for is a far better place
to start than a large number everyone is.

So the plan is: take the whole B2B cluster because it is cheap to take, and
do not mistake it for the growth engine. The growth engine is the student
side, which is in `student-queue.md` and has orders of magnitude more volume.

---

## Tier 1, write these first

Exactly what OfficeYak is, bought by the person searching, and essentially
uncontested. Each needs its own landing page, not a blog post.

**Built as four pages, not eight.** The rows below originally named eight
page paths, and several of them were the same question asked twice:
"education consultancy crm", "crm for education consultancy" and "best crm
for education consultancy" are one intent, and "attendance and payroll
management system" is the attendance page with a paragraph about payroll on
it. Eight near-identical pages about one product would compete with each
other for a total of maybe two hundred searches a month, and would be
recognised for what they were. The four that exist are each about a genuinely
different part of the product, so the rows now point at whichever of the four
answers them:

- `/software/education-consultancy-crm` — the whole thing, for an owner
- `/software/enquiry-management-software` — before they are a student
- `/software/attendance-management-system` — staff, geofence, payroll
- `/software/student-attendance-management-system` — class registers

Before writing them I checked each claim against the code, because a landing
page that promises a feature is a refund request with better typography.
Class registers are real (`class_attendance`), the geofence is real
(`lat`, `lng`, `radius_m` in `src/modules/attendance/geofence.ts`), and
payroll genuinely reads the days clocked in the Nepali month. Nothing on the
pages is on a roadmap.

| Keyword | Page to build | Status |
| --- | --- | --- |
| education consultancy crm | /software/education-consultancy-crm | live |
| crm for education consultancy | same page, variant | live |
| best crm for education consultancy | same page, variant | live |
| consultancy management system | /software/education-consultancy-crm | live |
| best consultancy management system | same page, variant | live |
| enquiry management software | /software/enquiry-management-software | live |
| student attendance management system | /software/student-attendance-management-system | live |
| attendance and payroll management system | /software/attendance-management-system | live |

## Tier 2, the attendance cluster

These carry real commercial intent, a real cost per click, and Low
competition. OfficeYak has the feature already, with a geofence, which is
more than most of the free tools ranking for these can say.

| Keyword | Page to build | Status |
| --- | --- | --- |
| attendance management system | /software/attendance-management-system | live |
| online attendance management system | same page, variant | live |
| online attendance system | same page, variant | live |
| cloud based attendance system | same page, variant | live |
| employee attendance management system | /software/attendance-management-system | live |
| automated attendance system | same page, variant | live |
| staff attendance software | same page, variant | live |
| student attendance software | /software/student-attendance-management-system | live |

## Tier 3, the lead cluster, education framing only

"Lead management software" unqualified is Salesforce, Zoho and HubSpot
territory and the traffic is not ours even if we got it. In an education
frame it is winnable and the visitor is the right person.

| Keyword | Page to build | Status |
| --- | --- | --- |
| lead management system | /software/enquiry-management-software | live |
| lead tracking crm | same page, variant | live |
| crm lead management system | same page, variant | live |
| free attendance management system | /software/attendance-management-system, free tier section | live |

---

## Found 29 September 2026, not yet writable

The B2B queue has no unblocked `todo` left in it. Every row in all three tiers
above is `live`, so the brief's rule to alternate between this file and
`student-queue.md` cannot be honoured this week. This is the gap that was
found instead, and it is genuinely the most urgent question this site's B2B
buyer has.

| Keyword | Page to build | Status |
| --- | --- | --- |
| educational consultancy registration nepal 2083 | a guide, `content/blog/` | **blocked**, needs an official source |
| consultancy license renewal nepal | same page, variant | **blocked**, same |
| education consultancy rules nepal 2026 | same page, variant | **blocked**, same |

The Government of Nepal has a new Educational Consultancy Service Regulation,
2083 (2026), covering registration, licensing, financial security,
infrastructure, counsellor qualifications and penalties. Consultancy blogs
across the Nepali web are already writing about it. `start-education-consultancy-nepal.md`
predates it and does not mention it.

**Do not write this from those blog posts.** Every claim would be a licensing
rule that a reader acts on legally, and the versions circulating do not agree
with each other. The page needs the regulation itself, from an official
government publication, and outbound network access is blocked, so it could
not be read on 29 September. Unblock the network, read the source, then write
it. Until then this row stays `blocked` rather than `todo`, so the daily run
does not pick it up and guess.

---

## Do not chase these

They appeared in the same data and they are traps.

- **best crm for leads, sales lead management software, lead generation crm,
  best crm lead management software.** Global terms owned by companies with
  a hundred times the domain authority. Even a win brings visitors who want
  a sales CRM and will leave.
- **free time clock software, employee time clock software, workforce time
  clock.** Different product, different buyer, and the searcher wants free
  forever.
- **iso 9001 consultants, top mortgage crm, real estate lead management
  software, insurance lead management system.** Different industries
  entirely. The keyword tool matched on the word "consultant" or "lead".
- **attendhrm, zoho lead management.** Competitor brand names. You cannot
  rank for someone else's brand and you should not try.

---

## How the routine uses this

Each morning it takes the first line marked `todo`, writes the page or the
guide for it, opens a branch, and changes the status to `drafted` with the
branch name. Nothing is published without you reading it first.
