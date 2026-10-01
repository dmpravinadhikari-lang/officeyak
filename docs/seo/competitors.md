# Competitor teardown

Replaced in full by each monthly run. This one ran on 1 October 2026 and is
the **first** teardown, so there is no previous month to compare against: the
counts below are the baseline the next run measures movement from, not a
movement in themselves. Where a number is a sitemap count it is written as
one, because a sitemap is what a site claims it has, not what Google indexed.

**One limitation up front.** `hamrocrm.com` could not be reached from this
environment at all. Both `curl` and the fetch tool failed on DNS
(`EAI_AGAIN`), and an earlier attempt failed at the proxy with a
`CONNECT tunnel failed, response 502`. Search results prove the site is alive
and indexed, so this is an environment problem and not a dead competitor.
Everything below about Hamro CRM is therefore read off search results rather
than off their pages, and their section is partial. It is the competitor the
brief calls the one to watch, so this is worth fixing before the next monthly
run.

---

## Hamro CRM, `hamrocrm.com`

**Pages indexed, roughly:** not measurable this run, see the limitation above.

**What they rank for that we do not.** They hold at least two blog posts
aimed squarely at our Tier 1 term:

- `/blog/best-crm-for-education-consultancy-nepal`
- `/blog/best-crm-for-education-consultancy-nepal-2026`

The second is the significant one. It is the same page refreshed with the year
in the slug, which is a deliberate play for the "best CRM 2026" query shape
and means they are actively tending this keyword rather than having written it
once. We have `/software/education-consultancy-crm` live against the same
intent and, per Search Console, no impressions on it yet.

**Claims they make.** Nepal's number one CRM for education consultancies,
trusted by 50 or more consultancies in Kathmandu, Pokhara and across Nepal,
and built for Nepal and India. Lead capture, counsellor assignment,
lead-to-student conversion, follow-up tracking, and a finance module covering
payments, pending balances, expenses, invoices, refunds and per-student
history. They also market data migration from spreadsheets with hands-on
help, and onboarding for counsellors, managers and accountants separately.

**What that means for us.** The migration-and-onboarding promise is aimed at
exactly the buyer the brief describes, the owner whose office has outgrown
four spreadsheets. It is the part of their pitch we have least to say about.

**What they have stopped doing.** Cannot be assessed without reading the site.

## CMST (Consultancy Manager), `cmst.xyz`

**Pages in sitemap:** 17.

**What those 17 are.** Home, `/feature`, `/pricing`, `/contact`, and then
`/register`, `/login`, `/reset-password`, `/visa-status`,
`/terms-of-service`, `/privacy-policy` and similar. That is an application
with a brochure attached, not a content operation.

**What they rank for that we do not.** Nothing by writing. They do appear in
third-party listings, including a Kumari Job employer page titled "Best
Consultancy Management System in Nepal", which is somebody else's page doing
the ranking for them.

**What they have stopped doing:** they never started. The brief's read of them
as thin is confirmed.

## Agentcis, `agentcis.com`

**Pages in sitemap:** 540, across 3 child sitemaps.

**Shape of it:** 31 pages under `/features`, a blog with 7 categories, and
then a cluster of individually targeted landing pages on the generic terms,
among them `/student-visa-consultant`, `/international-student-agency`,
`/visa-advisor`, `/foreign-education-consultants`, `/overseas-consultancy`
and `/abroad-education-consultancy-services`.

**What they rank for that we do not.** The generic global vocabulary of the
industry, one page per phrase. This is a resourced, deliberate programme and
the brief is right that trying to outrank them on generic terms is not the
move.

**What we have that they do not.** Nothing Nepal-specific in that list. Not
one of those 540 URLs is about the Nepali month, Bikram Sambat, a rupee
figure, the NOC, or a geofence that knows where Pokhara is. That remains the
winnable ground and nothing this month changed it.

## OSOM, `osom.global`

**Pages in sitemap:** 1. Their `sitemap.xml` contains the homepage and
nothing else, which tells us about their sitemap rather than about their site:
search results show at least
`/blog/crm-for-student-journey-nepal-consultancies`, a Nepal-framed post that
the sitemap does not list.

**What they rank for that we do not.** The Nepal-framed CRM-journey angle,
occasionally, as the brief said.

**What they have stopped doing.** Their sitemap is either broken or
abandoned. A site actively investing in content does not ship a one-URL
sitemap.

## Pace CRM, `thepaceinfosys.com`

**Pages in sitemap:** 98. Of those, **72 are blog posts**, 17 are
`/services`, 3 are `/products`.

**This contradicts the brief.** The brief lists Pace as "thin" and a product
competitor that barely publishes. 72 blog posts is not thin, and they hold
`/products/crm/consultancy-crm-software` titled "Best CRM for Education
Consultancy in Nepal", which is a direct hit on our Tier 1 term. The brief's
table should be corrected.

**What they rank for that we do not.** The same Tier 1 B2B intent, plus
whatever those 72 posts cover. They are a bigger content competitor than we
had them down as.

## Lexus AI, `lexuscrm.com`

**Pages in sitemap:** 1,132, of which **1,131 sit under `/detail/`** with
opaque IDs like `/detail/31765651864`.

**Those pages are empty.** Sampled URLs return HTTP 200 with a zero-byte
body: no title, no text. So the headline number is 1,132 URLs and the real
number of pages with content on them is close to 1. This is a sitemap full of
nothing, and it is the kind of thing that damages how a whole domain is
assessed.

**What they rank for that we do not.** Nothing demonstrable.

**What they have stopped doing.** Whatever `/detail/` was meant to be, it is
not serving content now.

---

## What we rank for that they do not

**Nothing yet, and it is important to say that plainly rather than dress it
up.** Search Console for `officeyak.com` holds four days of data, 25 to 28
September 2026, totalling 1 click and 5 impressions against a single query,
"enquiry management system australia". The site went live in September. There
is no ranking position to defend this month because there is not yet a
ranking. Every comparison above is about their content against our content,
not their results against our results.

---

## The three things this changes about our plan

**1. Four competitors now hold a page against our Tier 1 B2B term, not one.**
Hamro CRM has two posts on "best CRM for education consultancy Nepal" and has
refreshed one with 2026 in the slug. Pace has a product page with almost that
exact title. OSOM has a Nepal-framed CRM post. Kumari Job ranks a listing
page for CMST. The brief's read that the B2B cluster is "nearly uncontested"
was true when the queue was written and is no longer true for the head term.
It is still true for the attendance and enquiry clusters. The B2B pages should
stop being treated as done-and-live and start being treated as pages with
competition that need to be better than four other pages.

**2. Pace CRM has been misclassified and should be reclassified.** 72 blog
posts and a directly competing product page is a content competitor, not a
product competitor that barely publishes. The brief's competitor table says
otherwise and should be corrected, because the daily routine reads that table
to decide what to bother checking.

**3. The winnable ground is confirmed, and it is the only thing confirmed.**
Across 540 Agentcis URLs, 98 Pace URLs and 17 CMST URLs there is nothing
about the Nepali month, Bikram Sambat dates, the NOC, rupee figures or a
Nepal-aware geofence. The operational Nepal-specific material is still
unclaimed by anybody. Combined with finding 1, the read is: do not fight for
the head B2B term on its own terms, and do push the material none of them can
write, which is also the material the student side already rewards.
