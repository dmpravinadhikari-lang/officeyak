# Playbook: monthly

Runs on the 1st. This is the run that checks whether things that were true a
month ago are still true, and removes what is not working. It publishes
nothing new.

**Budget: ninety minutes.**

---

## 1. Re-verify every figure that carries a date

Go through every page that quotes a number sourced from somewhere: government
fees, visa funds requirements, exchange rates, statutory rates, anything with a
"as of" date on it.

For each one, fetch the official source named on the page and compare.

- **If the figure still matches**, update the checked-on date and nothing else.
- **If it has changed**, update the figure, update the date, and list it in the
  report under a heading that cannot be missed.
- **If the source page has moved or gone**, do not substitute a different
  source and do not keep the old number quietly. Flag it. A figure whose source
  has vanished is a figure nobody can check.

This section is the reason this run exists. A wrong funds requirement on a page
a family is planning around does more damage than every other item here
combined, and it goes wrong silently, because pages do not announce that the
world moved underneath them.

## 2. Find what is not working

From Search Console, if connected:

- **Every page with zero clicks in 90 days.** For each, decide: improve it,
  merge it into a better page, or remove it. Removing is allowed and is often
  right. Pages nobody ever chooses drag on how the whole site is assessed.
- **Every page whose position has declined steadily for three months.** That is
  a different problem from a page that never ranked, and usually means
  something better was published elsewhere.
- **Any page competing with another page of ours for the same query.** Two of
  our own pages splitting one intent is a problem we made and can fix.

Do the merges and removals for content pages. Put redirects in place for
anything removed. Do not remove a page that has inbound links from other sites
without saying so in the report first.

## 3. The queue, re-ranked

Re-read the queue files against what the last month actually taught you, not
against what seemed sensible when they were written.

- Promote anything the data shows is closer than expected
- Demote or delete anything that has had a page for a month and gone nowhere
- Add the questions that showed up in Search Console that nobody has written
  for
- Move to a "do not chase" list anything the month proved is the wrong
  audience, and say in one line why

A queue that is never re-ordered is a plan made once and followed forever.

## 4. Full competitor teardown

Once a month, properly, for each competitor in the brief:

- How many pages do they have indexed, roughly, and how has that moved
- What are they ranking for that we are not
- What are we ranking for that they are not, which is the thing to defend
- What have they stopped doing

Write it into `docs/seo/competitors.md`, replacing last month's. One section
per competitor, and a final section: **the three things this changes about our
plan.** If it changes nothing, say that; a month where competitors did nothing
interesting is a useful finding and should not be padded into a page of prose.

## 5. Technical, the slow checks

The things too slow to run daily:

- Crawl every page, not just the sitemap, and find anything reachable that is
  not in the sitemap and anything in the sitemap not reachable
- Core Web Vitals field data, if a key is available, for the top 10 pages
- Check the whole site renders without JavaScript
- Check every outbound link still resolves
- Check the structured data across the site still validates, and that nothing
  declares a price, a rating or an offer that contradicts the actual site

## 6. Report

Longer than the others, and structured:

1. **Figures that changed.** First, always, even if the answer is none.
2. What was removed or merged, and what redirects were added.
3. What the competitor work changed about the plan.
4. Technical findings, split into fixed and needs-a-decision.
5. What is still blocked on the owner, with the same items as last month marked
   as such, so that a thing that has been blocked for three months looks like
   what it is.

Also write the machine readable report, exactly as the daily playbook's section
on it describes: `content/seo/latest.json` plus a dated copy under
`content/seo/history/`, with `kind` set to `monthly`. The owner's Marketing tab
reads whichever run wrote last, so a run that skips this is a run that did not
happen as far as that screen is concerned.

The same two rules apply and apply hardest here: never write a figure you did
not measure, and put everything you were not allowed to change into
`suggestions`, with `needsYou` set on anything only a person can clear. On this
run that list is the point of the exercise.
