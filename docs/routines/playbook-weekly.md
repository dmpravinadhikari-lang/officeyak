# Playbook: weekly

Runs Monday morning. This is the run that reads the data and decides what the
week is for. It writes one thing: a plan. It does not publish pages; the daily
run does that, and it will follow the plan you leave behind.

**Budget: forty-five minutes.** It is allowed to be slower than the daily run
because nothing downstream is waiting on it.

---

## 1. Search Console

The credential is in the environment as `GOOGLE_SERVICE_ACCOUNT_B64`, base64
of a service account JSON key. Decode it to a temporary file, point
`GOOGLE_APPLICATION_CREDENTIALS` at it, and delete the file before the run
ends. Never print it and never commit it. The property is
`sc-domain:officeyak.com` and the scope is
`https://www.googleapis.com/auth/webmasters.readonly`.

The account has Restricted permission, which is read only on purpose. It can
query performance data and inspect URLs. It cannot submit a sitemap or request
a removal, and it is not supposed to: report anything that would need those
rather than asking for the permission to be widened.

If the credential is missing or a call is refused, skip to section 3, say in
the report that this was skipped and what it needs, and do not substitute
guesswork for it. Half this playbook is worth nothing without real query data
and pretending otherwise produces a confident plan built on nothing.

Pull the last 28 days and the 28 before, and answer these five questions:

**Which queries sit between position 5 and 15?**
These are the pages the search engine already understands and is nearly willing
to show. An edit here is worth more than a new page. Rank them by impressions
and take the top five.

**Which pages have high impressions and low click-through?**
The page is being shown and nobody is choosing it. That is almost always the
title and the description, not the content. List them with their current title.

**Which queries are new this period?**
Queries that appeared in the last 28 days and not before. These tell you what
the site is starting to be understood as, which is often not what you intended.

**Which queries lost the most?**
Position or clicks down materially versus the previous period. Check whether
the page changed, whether a competitor published something, or whether the
whole query's volume moved.

**What is in the index that should not be, and what is missing that should be?**
Coverage and excluded pages, with reasons.

## 2. Analytics

Same credential as section 1, scope
`https://www.googleapis.com/auth/analytics.readonly`. GA4 property `556082656`.
Same rule as above: skip and say so if it is missing or refused.

- Where sessions came from, by channel, versus last week
- The landing pages that received them
- Where people left. Specifically: the pages with high entrances and high exit
  rates, because that is a page that attracted someone and then failed them
- Whether any of it reached a signup

Then one paragraph, not a table, answering: **what is the single biggest leak?**
Not a list of observations. One place where people are arriving and leaving,
and your best explanation of why.

## 3. Competitors, properly

For each competitor the brief marks as competing on content:

- What did they publish in the last seven days, and what keyword is it after
- Has anything of theirs started outranking a page of ours for a term we care
  about
- Do they have a page for a question we have no page for

Then write down the honest answer to one question: **is there anything here
worth copying, and anything here worth not copying?** A competitor publishing
five thin pages a week is a competitor showing you what not to do.

Do not touch their sites beyond reading published pages. No tooling that probes
or scrapes at volume.

## 4. Rendered checks

The daily run reads HTML. This one looks at pages as a browser draws them.

Install a headless browser if the environment does not have one, then for the
home page, one guide, one landing page and one tool page, at 390px and 1280px:

- Does anything overflow horizontally
- Is every interactive target at least 44 by 44 pixels
- Does every focusable element have a visible focus state
- Measure the contrast of the actual rendered text against its actual
  background, and list anything under 4.5:1 for body text or 3:1 for large text
- Are images sized so the layout does not jump as they load
- Does the page work with JavaScript disabled, since that is roughly what a
  search crawler and an AI retriever see first

Fix only what is mechanical and invisible, by the same test as the daily run:
would a person see a difference? A missing focus state that was never visible
is a fix. A contrast failure means changing a colour, which is visible, so it
is a suggestion with the measured ratio attached so the owner can decide.

## 5. Write the plan

Update `docs/seo/weekly-plan.md`, replacing last week's. It has four sections
and no more:

**What happened.** Three lines. Clicks and impressions versus last week, and
whether anything published in the last fortnight has started to move.

**The five pages to improve this week.** From section 1, in order. For each:
the URL, the query it is nearly ranking for, its current position, and the
specific change to make. Not "improve the content". Something a person could
do in twenty minutes.

**The five pages to write this week.** Reorder the queue files so the daily run
takes them in this order. This is how a weekly decision reaches a daily run:
you do not tell it what to write, you change what is next.

**What needs the owner.** Only things genuinely blocked on a person: a
credential, a decision, a fact only they know. If this section is empty, say
so, and mean it.

## 6. Commit and report

Commit the plan and any queue reordering to `main`. Separate commits from any
fixes.

Report: the biggest movement, the biggest leak, what the week's five pages are,
and what is blocked. If Search Console or Analytics were skipped, that goes
first, not last, because it is the thing that makes the rest of the report
weaker and the owner should know that before they read it.

Also write the machine readable report, exactly as the daily playbook's section
on it describes: `content/seo/latest.json` plus a dated copy under
`content/seo/history/`, with `kind` set to `weekly`. The owner's Marketing tab
reads whichever run wrote last, so a run that skips this is a run that did not
happen as far as that screen is concerned.

The same two rules apply and apply hardest here: never write a figure you did
not measure, and put everything you were not allowed to change into
`suggestions`, with `needsYou` set on anything only a person can clear. On this
run that list is the point of the exercise.
