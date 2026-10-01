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

---

## Re-verified by the monthly run, 1 October 2026

Every figure behind the `/study/` pages and the cost calculator was fetched
from the authority that the page itself names and compared. The detail is in
the run report; the short version for this queue is:

**Still correct, checked against the source:** the UK maintenance figures
(£1,171 a month outside London, £10,539 for nine months, £1,529 and £13,761
in London, and the 28 day rule), Australia's AUD 29,710, Canada's CAD 23,448
from 1 September 2026, New Zealand's NZD 20,000 a year and NZD 1,667 a month,
Ireland's EUR 10,000 and EUR 833 a month, Finland's EUR 9,600 and EUR 800 a
month, the US position that the I-20 sets the figure, and the US fees of USD
185 and USD 350.

**Corrected:** the UK visa fee, which had been £524 since before April and is
£558. Finland's bank statement period, which the page gave as three months
and Migri asks for six. Every exchange rate except NZD.

**Could not be verified and is flagged in the report, not quietly kept:** the
Australian visa application charge, because Home Affairs' fee pages refuse
automated requests; the NZD rate, because Nepal Rastra Bank does not publish
one; the NOC fee of NPR 2,000, because the portal publishes no fee schedule a
fetch can read; and the CAD 20,635 GIC figure in the Canada guide, which is a
bank figure rather than a government one.

**The AI tools rows are still blocked and have now been blocked for three
runs.** `ANTHROPIC_API_KEY` is absent from the environment. These rows carry
more volume than anything else left in this file and they are waiting on one
credential. That is the single highest-value thing the owner could unblock.
