# What the daily SEO routine does

The scheduled agent reads this file every morning and follows it. Edit this
file to change what it does. Nothing about the routine lives only in the
scheduler.

OfficeYak is software sold to education consultancies in Nepal. Consultancy
owners are the buyers. The free student tools are how those owners find out
OfficeYak exists, which is why the student keywords matter as much as the
software ones.

## House rules

These apply to everything the routine writes.

- **No em dashes.** Use a comma, a full stop or a colon.
- **Plain and specific.** One idea per paragraph. No sentence that restates
  its own heading. No marketing adjectives.
- **Never invent a number.** Not a statistic, not a fee, not a visa funds
  requirement, not a commission rate. If a figure cannot be sourced from an
  official government page, leave it out and say so in the report. A wrong
  funds figure on a page a family plans around is worse than no page at all.
- **Never push to main.** Everything goes on a branch for review.

## Part 1, is the site up

Check `https://officeyak.com` returns 200, and `https://officeyak.com/sitemap.xml`
returns 200 and contains at least 20 `<loc>` entries.

If either fails, stop. Make that the whole report, with as much detail as can
be gathered. Everything else is pointless while the site is down.

## Part 2, the technical audit

Fetch `/`, `/blog`, `/tools`, `/tools/cost`, `/privacy`, and two guides from
`/blog`. For each, record whether it has:

- a title, and how long it is
- a meta description between 70 and 160 characters
- a canonical link, pointing at the page's own address
- an `og:image`
- exactly one `h1`
- alt text on every image

Flag anything outside those. Then check one consultancy subdomain, such as
`https://demo.officeyak.com`, still returns an `X-Robots-Tag: noindex`
header, and that `https://officeyak.com` does not.

Fix anything that is purely mechanical: a missing canonical, a description
that is too long, a missing alt attribute. Do not change layout, wording that
a reader would notice, or anything that alters how the site looks or works.
Those go in the report as suggestions instead.

## Part 3, write one thing

Open `docs/seo/keyword-queue.md` and `docs/seo/student-queue.md`. Alternate
between them: if the last guide came from one, take the next `todo` from the
other. Skip anything marked `research`, and say in the report that it is
still blocked.

Write the page or guide for that keyword.

Blog guides are markdown in `content/blog/` with YAML front matter. Copy the
shape exactly from an existing file, for example
`content/blog/start-education-consultancy-nepal.md`. Every field matters:
`metaDescription` under 160 characters, five real FAQ entries that answer the
question rather than repeat the keyword, `internalLinks` to pages that
genuinely relate, and `sources` only where a real source was used.

Landing pages under `/software/` or `/study/` are Next.js pages in
`src/app/`. Follow the conventions in `src/app/tools/cost/page.tsx`: static
`metadata` with a canonical, one `h1`, and real content rather than a
keyword restated six ways.

Aim for 900 to 1300 words for a guide. Long enough to be the best answer on
the page, short enough that every paragraph earns its place.

If the guide needs cover art, add an entry to `scripts/blog-images.ts` in the
same shape as the others and run `npm run blog:images`.

## Part 4, commit and report

Run `npx tsc --noEmit` and make sure it passes. Commit to a branch named
`seo/<date>-<slug>` and push it. Update the queue file: change that row's
status from `todo` to `drafted`, with the branch name.

Then report, in this order and no longer than it needs to be:

1. Site up, yes or no
2. What the audit found, and what was fixed automatically
3. What was written, which keyword it targets, and the branch name
4. Anything blocked, and what it is blocked on

If nothing was wrong and the guide was written, say so in three lines. A
daily report that pads itself stops being read by the end of the first week.
