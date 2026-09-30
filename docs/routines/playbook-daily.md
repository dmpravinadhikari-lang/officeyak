# Playbook: daily

Runs every morning. You have already read the client brief. Everything below
refers to "the site", "the repo" and "the queues"; the brief says which.

This run has one job: leave the site healthier than you found it and one page
larger. It is not the run where you analyse anything. Resist the urge.

**Budget: aim to finish in twenty minutes.** A run that sprawls fails halfway
and leaves a branch nobody merges. If you are running long, finish the page you
are writing, commit it, and put everything else in the report.

---

## 1. Is the site alive

Fetch the site's home page and its `sitemap.xml`.

- Home page returns 200
- Sitemap returns 200, is valid XML, and has at least as many `<loc>` entries
  as it had yesterday

**If the home page does not return 200, stop.** Make that the entire report,
with the status code, the response body if there is one, and anything
`curl -v` reveals. Do not audit, do not write, do not commit. Everything below
is pointless while the site is down, and a report that buries an outage under a
blog post is a bad report.

**If you cannot reach the site at all** because of a network or proxy refusal
rather than a site failure, say exactly that and name the host that was
refused. Do not report it as an outage. They are different problems with
different fixes and confusing them wastes the owner's morning.

## 2. Did yesterday's page land

One Search Console check belongs in a daily run and this is it. Everything else
about position and clicks is in the weekly run, because it does not change
overnight and looking at it daily produces noise that tempts you into editing
pages that were working.

Take the page this routine published yesterday, from yesterday's report in
`content/seo/history/`. Ask the URL Inspection API whether Google has indexed
it, using the same credential the weekly playbook's section 1 describes.

What to do with the answer:

- **Indexed.** Say so in one clause and move on. This is the normal case and it
  does not deserve a paragraph.
- **Not indexed, and the page is under a week old.** Also normal. Google is
  often slow with a new page on a small site. Note it without alarm and do not
  act.
- **Not indexed after a week.** Now it means something. Check the obvious
  causes in this order and report which one it is: the page is not in the
  sitemap, it is blocked by robots.txt, its canonical points somewhere else, or
  nothing on the site links to it. The last of those is the most common and the
  easiest to miss, which is why section 5 asks you to link into every new page
  as you publish it.
- **Indexed but with a different canonical than its own address.** Google has
  decided this page duplicates another one of ours. That is worth a line in the
  report and a look at whether the two pages should be one page.

Do not request indexing. The service account has Restricted permission and
cannot, deliberately. Fix the cause instead: a page that needs to be begged
into the index every time has a problem that begging does not solve.

## 3. Crawl what is published

Read every URL in the sitemap. For each one record:

- status code, and the full chain if it redirects
- `<title>`, and its length
- meta description, and whether it is between 70 and 160 characters
- canonical link, and whether it points at the page's own address
- `og:image`
- exactly one `<h1>`
- heading order, with no level skipped
- every `<img>` has a non-empty `alt`, except those marked decorative
- any structured data parses as valid JSON and declares a `@type`

Also check, once, across the site:

- `robots.txt` is reachable and does not block anything public
- any private or tenant subdomain still returns `X-Robots-Tag: noindex`, and
  the public site does **not**
- no page in the sitemap returns anything but 200
- no internal link anywhere points at a 404

## 4. Fix what is mechanical

Fix these yourself, now, without asking:

- a missing or wrong canonical
- a meta description that is missing, too long or too short
- a missing `alt` attribute
- a missing `og:image` reference
- a broken internal link, where the correct target is unambiguous
- structured data that is invalid or missing a required field
- a heading level skipped in the markup
- a page missing from the sitemap that should be in it

**The test for whether a fix is yours to make: would a person looking at the
page in a browser see any difference?** If no, fix it. If yes, it is a
suggestion for the report, however obviously right it seems. That line is not
about your judgement being poor. It is about the owner being able to trust that
the site did not change shape overnight without anyone deciding it should.

Do not fix anything in the paths the brief forbids, even if it is broken. Note
it in the report and leave it alone.

## 5. Write and publish one page

One. Not two.

Take the next `todo` from the queues, alternating between them as the brief
describes. Skip anything marked `research` or `blocked` and say in the report
that it is still blocked and on what.

Before writing a single sentence about what the product does, **find it in the
code**. If the brief says the product has a feature, confirm the feature
exists. If you cannot confirm it, do not write it. This is the rule that keeps
the marketing honest and it is not optional.

Write the page following the shape of the example file the brief names. Match
its front matter or its module structure exactly; every field in it is load
bearing.

What makes it finished:

- It answers one question completely, and the answer is in the first two or
  three sentences under the heading that asks it.
- Roughly 900 to 1300 words for a guide. Long enough to be the best answer on
  the page, short enough that every paragraph earns its place.
- Real FAQ entries that answer the question rather than restate the keyword.
- Internal links to pages that genuinely relate, and that exist. Check them.
- Sources only where a real source was used, with the date it was checked.

### Link into it before you move on

A page nothing links to is a page search engines reach last and readers never
reach at all. The sitemap is not a substitute for a link.

So, having written it: find two or three existing pages that genuinely relate,
and add a link to the new page from inside their prose, using words that
describe where the link goes. Not a "related posts" list at the foot, which
readers skip and which carries less weight. If no existing page relates closely
enough that a link would read naturally, say so in the report rather than
forcing one in.

Then check the reverse: any page in the sitemap that nothing else links to at
all. Fixing every orphan is a weekly job, but a new one appearing is worth a
line in today's report.

### Check the page you just wrote

Before committing, fetch it as a reader would:

- every internal link resolves, no 404s
- every outbound link resolves, and none has quietly become a parked domain
- the structured data parses and declares a type
- it has a title, a description in range, a canonical, and one `h1`

Then:

```
npx tsc --noEmit
```

If that fails, fix it. If you cannot fix it, commit nothing, and make the
failure the report.

## 6. Commit and publish

Commit the page and the mechanical fixes **separately**. Two commits, because
they are two different kinds of change and someone reading the history later
will thank you.

Commit to `main` and push. The brief says how the site deploys; if it deploys
by watching `main`, the page is live within minutes and you do not need to do
anything else. If the brief says otherwise, follow it.

Use explicit paths when staging. `git add -A` sweeps up whatever else happens
to be in the working tree, including other people's unfinished work.

Update the queue file: change that row's status from `todo` to `live`.

## 7. Watch the competitors, briefly

For each competitor the brief marks as competing on content, fetch their blog
index or sitemap and note anything published since yesterday. Title and URL is
enough. Do not read them in depth and do not react today; the weekly run
decides what to do about it.

If none published anything, say nothing about it in the report.

## 8. Write the machine readable report

The owner has a Marketing tab in the admin console that reads this. It is the
only way anything you did today reaches a screen, so it is not optional and it
is not a summary of the report below: it is the same run, in a form something
else can read.

Write `content/seo/latest.json`, and a copy at
`content/seo/history/<YYYY-MM-DD>-<kind>.json`. The shape is defined in
`src/modules/seo/report.ts`; read that file rather than guessing at field
names, because a field the page does not know about is a field nobody sees.

Two rules about it, and they matter more than completeness:

**Never write a number you did not measure.** Every block is optional. If you
could not reach Search Console, omit `search` entirely. The page renders a
sentence saying the credential is missing. A zero would render as an answer,
and somebody would believe it.

**`site.unreachable` and `site.up: false` are different things.** Use
`unreachable` when a network or proxy policy refused the host, and leave `up`
alone. Use `up: false` only when you reached the site and it answered badly.
The page draws a red banner for one and an amber one for the other, and telling
the owner the site is down when it is not is the single worst thing this
routine can do.

Put anything you were not allowed to fix into `suggestions`, and set `needsYou`
on the ones only a person can clear: a credential, a decision, a fact you do
not have. Those are pulled to the top of the tab under "Waiting on you".

Section 2's answer goes in the `indexing` block. Omit the block entirely if you
did not run the check, because the tab treats a missing block as "not measured"
and an `indexed: false` as "Google does not have it", and those are different
things. Set `ageDays` whenever you know it: the tab uses it to say that a page
under a week old is ordinarily not indexed yet, so the owner is not told a
normal thing looks broken.

Commit this with the fixes, not with the page. It describes the run, not the
content.

## 9. Report

Four lines on a normal day, in this order:

1. Site up, yes or no
2. What the audit found and what you fixed
3. What you published, which keyword it targets, and the live URL
4. Anything blocked, and specifically what it needs from the owner

Then, and only if there is one, a fifth line: the single most useful thing you
noticed that you were not allowed to fix. One. Not a list. A daily report that
turns into a backlog stops being read.
