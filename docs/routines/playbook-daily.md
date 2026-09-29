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

## 2. Crawl what is published

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

## 3. Fix what is mechanical

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

## 4. Write and publish one page

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

Then:

```
npx tsc --noEmit
```

If that fails, fix it. If you cannot fix it, commit nothing, and make the
failure the report.

## 5. Commit and publish

Commit the page and the mechanical fixes **separately**. Two commits, because
they are two different kinds of change and someone reading the history later
will thank you.

Commit to `main` and push. The brief says how the site deploys; if it deploys
by watching `main`, the page is live within minutes and you do not need to do
anything else. If the brief says otherwise, follow it.

Use explicit paths when staging. `git add -A` sweeps up whatever else happens
to be in the working tree, including other people's unfinished work.

Update the queue file: change that row's status from `todo` to `live`.

## 6. Watch the competitors, briefly

For each competitor the brief marks as competing on content, fetch their blog
index or sitemap and note anything published since yesterday. Title and URL is
enough. Do not read them in depth and do not react today; the weekly run
decides what to do about it.

If none published anything, say nothing about it in the report.

## 7. Report

Four lines on a normal day, in this order:

1. Site up, yes or no
2. What the audit found and what you fixed
3. What you published, which keyword it targets, and the live URL
4. Anything blocked, and specifically what it needs from the owner

Then, and only if there is one, a fifth line: the single most useful thing you
noticed that you were not allowed to fix. One. Not a list. A daily report that
turns into a backlog stops being read.
