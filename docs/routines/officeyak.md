# Brief: OfficeYak

## What this is

OfficeYak is the software an education consultancy in Nepal runs its office on.
Student enquiries, the student files themselves, the documents, class registers,
staff attendance with a geofence, payroll in the Nepali month, and what each
university partner owes in commission, all in one system instead of four
spreadsheets and a paper register. It is sold to the owner of the consultancy,
who is usually buying it because the office has grown past the point where one
person can hold it in their head.

**Domain:** `officeyak.com`
**Repository:** `https://github.com/dmpravinadhikari-lang/officeyak`
**Live since:** September 2026

## Who buys it

The owner of an education consultancy, typically with one to five branches and
somewhere between thirty and four hundred active student files. They are not a
technical buyer. They start looking at the moment something expensive goes
wrong that they can see was avoidable: a student who was never called back, a
visa deadline missed, a counsellor who resigned and took their list with them,
or a month where nobody could say how many students were at offer stage.

They are price sensitive in a specific way, and the specifics changed in
September 2026, so check `src/lib/plans.ts` before writing anything about
price. Plans now count **staff accounts and offices**, not students: Starter is
5 staff and 1 office, Growth is 15 and 3, Pro is unlimited on both. Students
are unlimited on every plan.

What that means for the writing. The thing this buyer genuinely fears is a
price that makes them ration logins, because the counsellor left without an
account writes on paper and the paper is not in the system. We are not outside
that concern now, we sit inside it with a ceiling, so never write that OfficeYak
has unlimited staff accounts, and never write that it does not charge per seat.
Both were true before September and are false now. What is true and worth
saying is that no plan charges by student, so a consultancy is never billed for
a good intake, and that the ceilings are published rather than negotiated.

Anything already published that contradicts this is a defect to report, not a
page to leave alone.

## Who else reads the site

Students and their parents, in far greater numbers than owners. The free tools
(cost calculator, eligibility check, university finder, SOP help) and the
destination guides under `/study/` exist for them. This is deliberate. The
student side has orders of magnitude more search volume than the B2B side, and
it is how consultancy owners find out OfficeYak exists in the first place. An
owner who has seen the cost calculator their students keep using is a warmer
lead than one who arrived on a software page cold.

Do not let the student content be treated as a side project. It is the top of
the funnel.

---

## How the site is built

**Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind v4 with
`@theme` tokens. Data in SQLite through `src/lib/db`.

**Blog posts live in:** `content/blog/*.md`, markdown with YAML front matter.
No database, no CMS. Adding a file adds the post, its metadata, its structured
data and its sitemap entry.

**Landing pages live in:** `src/app/**/page.tsx`, with their written content
separated into a module under `src/modules/` so the page file stays layout and
the words stay editable.

**Copy an existing one:**
- A guide: `content/blog/start-education-consultancy-nepal.md`
- A destination page: `src/modules/study/destinations.ts` + `src/app/study/[country]/page.tsx`
- A software page: `src/modules/software/pages.ts` + `src/app/software/[slug]/page.tsx`

**Sitemap:** generated in `src/app/sitemap.ts` from the content itself. Never
edit it to add a URL; add the content and the URL follows.

**Deploys by:** pushing to `main`. The server polls `origin/main` and runs
`deploy/deploy.sh` when it moves. That script builds into a scratch directory,
refuses to swap in an incomplete build, checks the site returns 200, and rolls
back to the previous build if it does not.

**Never push a build the agent has not run `npx tsc --noEmit` against.**

## House style

- **No em dashes.** Use a comma, a full stop or a colon.
- **Never invent a number.** Not a statistic, not a government fee, not a visa
  funds requirement, not a commission rate. If a figure cannot be sourced from
  an official government page, leave it out and say so in the report. A wrong
  funds figure on a page a family plans around is worse than no page at all.
- **Never claim a feature the product does not have.** Before writing that
  OfficeYak does something, find it in the code. A landing page that promises a
  feature is a refund request with better typography.
- One idea per paragraph. No sentence that restates its own heading. No
  marketing adjectives.
- Write the answer in the first two or three sentences under the heading that
  asks the question. Both Google and every AI search tool read pages that way.

---

## Competitors

| Name | Site | Their content | Compete on content? |
| --- | --- | --- | --- |
| Hamro CRM | `hamrocrm.com` | `/blog` | **Yes, directly.** Publishing against the exact target keywords, claiming 50+ Nepali consultancies. The one to watch. |
| CMST (Consultancy Manager) | `cmst.xyz` | thin | Product competitor, barely publishes |
| Agentcis | `agentcis.com` | `/blog` | Yes, but global and better resourced. Do not try to outrank them on generic terms |
| OSOM | `osom.global` | `/blog` | Occasionally, Nepal framing |
| Pace CRM | `thepaceinfosys.com` | thin | Product competitor |
| Lexus AI | `lexuscrm.com` | some | Product competitor, some Nepal content |

On Agentcis specifically: they are the incumbent and they have more of
everything. Do not write comparison pages that pretend otherwise. The winnable
ground is Nepal specific and operational, the things a global product does not
do: the Nepali month payroll, Bikram Sambat dates, rupee figures, a geofence
that knows where Pokhara is.

## Keywords

**Queue files:**
- `docs/seo/keyword-queue.md` (B2B, the commercial one)
- `docs/seo/student-queue.md` (student side, the growth engine)

Alternate between them. If the last page came from one, take the next `todo`
from the other. The B2B cluster is small (10 to 100 searches a month) and
nearly uncontested, so it is cheap to take and it is not a business on its own.
The student side is where the volume is.

Never write eight pages for eight keywords that ask the same question. Cluster
them onto one page and record which keywords that page is meant to answer.

---

## What the agent may change without asking

- `content/blog/**` — write, edit and publish guides freely
- `src/modules/study/**`, `src/modules/software/**` — the written half of the
  marketing pages
- `src/app/study/**`, `src/app/software/**`, `src/app/blog/**`, `src/app/tools/**`
  — marketing pages, but layout changes only where they fix a genuine defect
- `src/app/sitemap.ts`, `src/app/robots.ts`, metadata, canonicals, structured data
- `public/` images and their alt text
- `docs/seo/**` — update queue statuses, add findings
- Mechanical on-page fixes anywhere public: a missing canonical, an over-long
  meta description, a missing alt attribute, a broken internal link, a missing
  `og:image`, invalid structured data

## What the agent must never touch

- `src/app/app/**` — the product itself, everything behind the login
- `src/lib/db/**`, including `schema.sql`. Migrations are not an SEO task
- `src/lib/auth*`, sessions, permissions, anything to do with who can see what
- `src/modules/payroll/**`, `src/modules/fees/**`, `src/modules/partners/**`,
  `src/modules/classes/**`, `src/modules/account/**` — another session owns these
- `deploy/**`, `next.config.ts`, `package.json`, CI configuration
- `src/lib/legal.ts`, `/privacy`, `/terms` — a lawyer has to read those
- Anything that changes how an existing page **looks**. Fixing a missing alt
  attribute is mechanical. Changing a colour, a layout, a heading size or the
  wording of a live headline is not, and goes in the report as a suggestion.
- **Never force push. Never rewrite history. Never push to any branch but the
  one it is working on, except for the content commits the playbook allows.**

## Credentials available to the routine

| What | Status | Notes |
| --- | --- | --- |
| Network access to `officeyak.com` | **present** | The environment is on Full network access as of 30 September. Before that every run stopped at step one. |
| Google Search Console | **present** | `GOOGLE_SERVICE_ACCOUNT_B64` in the environment: base64 of a service account JSON key. Decode it, do not try to read it as JSON directly. The account is `officeyak-seo-agent@officeyak-seo.iam.gserviceaccount.com` with **Restricted** permission on the `sc-domain:officeyak.com` property, which is read only: it can query performance data and inspect URLs, and it deliberately cannot submit sitemaps or request removals. If something needs those, report it rather than asking for more permission. |
| Google Analytics 4 | **present** | The same credential. Property `556082656` (account `384997065`), tag `G-GGR6EVR2LR`, role Viewer. |
| PageSpeed Insights key | missing | Free. Enables Core Web Vitals field data. |
| Anthropic API key | missing | Unrelated to SEO, but it is why the AI tools still answer with sample text, which blocks the AI IELTS and AI mock interview pages. |

**How to use the Google credential.** It is one base64 string holding the
whole service account JSON. Decode it to a temporary file, use it as
`GOOGLE_APPLICATION_CREDENTIALS`, and delete the file before the run ends.
Never print it, never commit it, never write any part of it into a report or a
page. The scopes you need are
`https://www.googleapis.com/auth/webmasters.readonly` and
`https://www.googleapis.com/auth/analytics.readonly`.

If the credential is absent or a call is refused, that is a skipped section and
a line in the report, exactly as before. Do not fall back to guessing at
figures because a credential that used to work has stopped.

A missing credential is never a reason to fail the run. Skip that section,
carry on, and say in the report that it was skipped and what it needs.

---

## Where to report

A push notification with a summary, and the detail in the run log. Keep the
summary to four lines on a normal day. A daily report that pads itself stops
being read by the end of the first week.
