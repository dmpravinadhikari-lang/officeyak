# The student keyword queue

The other half, and the bigger half. Edit freely; the routine reads this the
same way it reads the B2B queue and alternates between the two.

**Why this matters more than the software keywords.** A consultancy owner in
Nepal does not search "education consultancy CRM". They hear about software
because a competitor mentions it, or because their own students arrive with
a cost breakdown printed from a website. The student side is where the search
volume is, and it is also how the software gets discovered. One feeds the
other, which is why the free tools exist at all.

## Ready to write, the data already exists

`src/modules/cost/data.ts` holds sourced tuition ranges, living costs and the
published visa funds requirement, with a source and a date, for six
destinations. These pages are not thin content: they are a real dataset with
a calculator attached.

| Keyword | Page to build | Status |
| --- | --- | --- |
| study in ireland | /study/ireland | **live** |
| cost of student visa to ireland | /study/ireland, the funds section | **live**, covered by the same page |
| study in uk | /study/uk | **live** |
| cost of student visa to uk | /study/uk, the funds section | **live**, covered by the same page |
| cost of student visa to canada | /study/canada | **live** |
| study in canada | /study/canada | **live** |
| cost of student visa to usa | /study/usa | **live** |
| study in usa | /study/usa | **live** |
| cost of student visa to australia | /study/australia | **live** |
| study in australia | /study/australia | **live** |
| cost of student visa to new zealand | /study/new-zealand | **live** |
| study in new zealand | /study/new-zealand | **live** |


## Ireland is the one unblocked page, week of 29 September 2026

`src/modules/cost/data.ts` already holds Ireland under `IE`: tuition, living,
the EUR 60 visa fee, health cover, and a funds requirement of EUR 10,000 with
the Irish Immigration Service as its source and the holding period written
down. Nothing has to be looked up, which matters this week because outbound
network access is blocked and no other queued page can have its figures
sourced.

The two Ireland rows are now one page, for the reason the next section gives.

## A note on the first one

`study in uk` and `cost of student visa to uk` were queued as two pages and
are one. The funds requirement is the reason somebody searches either of
them, and splitting it across two pages would have meant two thin pages
competing with each other rather than one that answers the question. The
remaining destinations should follow the same shape.

## Written without cost data

There is no cost data for these three. Writing the page means first adding
sourced figures to `src/modules/cost/data.ts`: the published funds
requirement, the visa fee, and indicative tuition and living ranges, each
with the government source it came from. Do not guess these numbers. A wrong
funds figure on a page a family plans around is worse than no page.

| Keyword | Page | Status |
| --- | --- | --- |
| cost of student visa to japan | /study/japan | **live**, no cost table |
| cost of student visa to korea | /study/south-korea | **live**, no cost table |
| cost of student visa to finland | /study/finland | **live**, no cost table |

Japan and Korea publish no national funds figure at all: in Japan the school
sets it through the Certificate of Eligibility, in Korea the university sets
it because Korean law requires the university to verify funds. Both pages say
that rather than quoting a number somebody made up. Finland does publish a
figure, EUR 9,600, and it is on the page with its source.

None of the three has tuition or living cost data in
`src/modules/cost/data.ts`, so those pages carry the funds section and the
process and leave out the cost table. Adding the cost data later turns the
table on with no further work.

## The AI tools

OfficeYak already does these. Nothing on the site says so to a searcher.

| Keyword | Page to build | Status |
| --- | --- | --- |
| ai ielts preparation | /tools/ielts-practice | **blocked**, no API key |
| ai pte preparation | /tools/pte-practice | **blocked**, no API key |
| ai mock interview | /tools/ai-visa-interview | **blocked**, no API key |
| ai visa interview practice | same page, variant | **blocked**, no API key |

**Do not take these off the queue yet.** The tools answer with sample text
until `OFFICEYAK_AI_PROVIDER` is set to `anthropic-api` with a key behind it.
A page that sells an AI IELTS examiner and returns canned text is a refund
request. The moment the key exists these become the next three to write, and
they carry more search volume than anything else left in this file.
