# Weekly plan, week of 29 September 2026

> **Search Console and Analytics were not read. Sections 1 and 2 of the weekly
> playbook were skipped in full, because neither credential exists in this
> environment.** Nothing in this plan comes from query data, position data,
> click-through data or session data. The playbook builds the improvement list
> out of Search Console positions, and that list could not be built at all.
> What stands in its place is measurement from a rendered browser check and
> from a public search result page, which is a weaker thing and is labelled as
> such throughout. Read the rest of this file knowing that.
>
> Also missing: network access to `officeyak.com` itself. Every check below ran
> against a production build of this repository served on localhost, not
> against the live site. The code is the same code. What that cannot catch is
> anything the deploy or the server does differently.

---

## What happened

There are no clicks or impressions to compare against last week, this week or
any week, because Search Console is not connected to this routine.

The site has been live since 27 September. Fifteen guides, five software and
destination page groups and the nine free tools went up between 26 and 27
September, and `main` has moved thirty-seven times since. Three days is shorter
than the reporting window Search Console would use anyway.

Whether any of that has started to move is unknown, and stays unknown until a
service account is added to the `officeyak.com` property and to GA4 property
`G-GGR6EVR2LR`.

---

## The five pages to improve this week

**This list is not the list the playbook asks for.** It is meant to be the five
queries sitting between position 5 and 15, ranked by impressions. With no
position data and no impression data, ranking five pages that way would be a
guess wearing a number, so it is not attempted.

What follows is one mechanical change, measured in a browser, that affects ten
pages. It is invisible to a reader, so the daily run can make it. It is ordered
by how much of the site it touches, not by search position.

1. **`/tools/cost`**: the rendered DOM carries zero `application/ld+json`
   blocks. The home page, `/blog/*`, `/study/*` and `/software/*` each carry
   one. Add a `WebApplication` block naming the tool, its `applicationCategory`,
   and `offers` at price 0, plus a `BreadcrumbList`. Every value comes off the
   page as it already reads. Invent nothing.
2. **`/tools/loan`**: same gap, same fix.
3. **`/tools/eligibility`**: same gap, same fix.
4. **`/tools/universities`**: same gap, same fix.
5. **`/tools`, `/tools/compare`, `/tools/checklist`,
   `/tools/document-checklist`, `/tools/cv-maker`, `/tools/scholarships`**:
   same gap. `/tools` should carry an `ItemList` of the nine tools rather than
   a `WebApplication`, and `/tools/scholarships` an `ItemList` of the
   scholarships it lists.

Only `/tools/scholarships/[id]`, the single-scholarship page, has structured
data today. The `/tools/scholarships` listing above it does not.
The brief calls the free tools the top of the funnel, and they are the only
group of public pages emitting nothing for a search engine or an AI retriever
to parse.

---

## The five pages to write this week

The queue files are reordered so the daily run takes them in this order. Four
of the five below are blocked on something the routine cannot supply, which is
the real finding of this section.

1. **`/study/ireland`** (student queue). **Unblocked, write this first.**
   `src/modules/cost/data.ts` already holds Ireland under `IE` with tuition,
   living, visa fee, health cover and a funds requirement of EUR 10,000 carried
   with its source and its holding period. No new figure has to be found. The
   queue previously listed Ireland as two rows, `/study/ireland` and
   `/study/ireland/cost`; those are now one row, following the same decision the
   file already records for the UK.

2. **Educational Consultancy Service Regulation 2083 (2026)** (B2B queue).
   **Blocked on sourcing.** A new registration and licensing regulation for
   consultancies exists and is being written about across the Nepali web. It is
   the most urgent question this site's B2B buyer has, and there is no page for
   it. It cannot be written this week, because every claim in it would have to
   come off an official government publication and outbound network access is
   blocked. Restating it from other consultancies' blog posts would put
   unverified licensing rules in front of people making legal decisions.

3. **`/tools/ielts-practice`** (student queue). **Blocked on the Anthropic API
   key.** The AI tools answer with sample text until `OFFICEYAK_AI_PROVIDER` is
   set to `anthropic-api` with a key behind it. A page selling an AI IELTS tool
   that returns canned text is a refund request.

4. **`/tools/ai-visa-interview`** (student queue). **Blocked, same reason.**

5. **`/tools/pte-practice`** (student queue). **Blocked, same reason.**

Behind these, the Japan, South Korea and Finland pages still carry no cost
table, and turning those on means adding sourced tuition and living figures to
`src/modules/cost/data.ts`. That is also blocked on network access, for the
same reason as item 2.

The B2B queue has no unblocked `todo` left in it. Every row in all three tiers
is `live`. The brief's rule is to alternate between the two queues, and this
week that rule cannot be honoured: there is one writable page and it is a
student page.

---

## What needs the owner

**Credentials, in the order they unblock the most.**

1. **Network egress to `officeyak.com` and to competitor sites.** Every request
   returns 403 at the proxy. This blocks the live-site checks, the competitor
   reading the playbook asks for, and any page whose figures must come off a
   government source. It is the single blocker behind three of the five pages
   above.
2. **Search Console**, a service account added as a user on the
   `officeyak.com` property. Half this playbook is worth nothing without it,
   and this week half this playbook was worth nothing.
3. **Analytics**, the same service account on GA4 property `G-GGR6EVR2LR`.
4. **An Anthropic API key**, which unblocks three of the five pages above.

**Decisions, from the rendered check. These change how a page looks, so they
are not the routine's to make.**

- **The cost calculator's sliders are hard to hit on a phone.** The thumb is
  26 by 26 pixels (`src/app/globals.css:311`), against a 44 by 44 target. The
  comment above that rule says 26 was chosen deliberately as the smallest
  catchable thumb, so this is a real trade-off and not an oversight. It is the
  primary interaction on the site's flagship free tool.
- **Header and footer targets are under 44 pixels tall.** Measured at 390px:
  "Login" at 58 by 36, "For consultancies" at 126 by 39, and every footer nav
  link at 40 tall, the last of these set explicitly by a `min-h-[40px]` class.
  Raising them to 44 is a small, deliberate-looking change that a person would
  see.
- **The slider focus ring is Chrome only.** `globals.css:322` styles
  `:focus-visible::-webkit-slider-thumb`, and there is no matching
  `::-moz-range-thumb` rule, while the host element sets `outline: none`. A
  Firefox user tabbing to a slider sees nothing. This one is arguably invisible
  until focused, but it lives in the global stylesheet, which the product
  behind the login also loads, so it is not the routine's file to edit.
- **With JavaScript disabled, all four pages tested render as a splash reading
  "One moment".** The real content is in the HTML, but Next.js streams it
  inside `<div hidden>` and swaps it in with an inline script. Without that
  script the visible text of the page is ten characters. Googlebot runs
  JavaScript and will see the page. An AI retriever that reads the DOM without
  executing anything will not. The cause is `src/app/loading.tsx`, which is a
  deliberate product decision and sits outside the paths this routine may
  change. It is worth a decision either way.

**No decision needed on contrast.** 554 text nodes were measured across the
four pages at both widths, against their actual rendered backgrounds. Nothing
failed. The floor is 4.65 to 1, amber `rgb(168, 83, 0)` on `rgb(238, 238, 242)`,
against a 4.5 threshold. The margin is thin enough that darkening that amber is
worth considering the next time somebody is in the palette, and not worth doing
on its own.

**Nothing else is blocked on a person.** Horizontal overflow: none at 390px or
1280px on any page tested. Images: every one carries a size or an aspect ratio,
so nothing shifts as the page loads.

---

## What was checked, so the next run does not repeat it

- Rendered in headless Chromium at 390px and 1280px: `/`,
  `/blog/start-education-consultancy-nepal`,
  `/software/education-consultancy-crm`, `/tools/cost`.
- Competitors: read from public search results only, since their sites cannot
  be reached from here. `hamrocrm.com` has at least two posts aimed at "best crm
  for education consultancy nepal", one of them carrying 2026 in its URL, which
  is the exact intent behind three Tier 1 rows of the B2B queue. Whether either
  was published in the last seven days could not be established.
- Three competitors are ranking for our terms and are **not in the brief's
  competitor table**: `nepaliconsultancy.com` (NC-CRM), `thulo.com.np`, and
  `meroattendance.com`. The last of these sells attendance, HRMS, payroll and
  GPS attendance in Nepal, which is the whole of the Tier 2 attendance cluster.
  The brief's table is worth updating.
- Worth copying: nothing observed. Worth not copying: every competitor page
  found for our Tier 1 terms is a blog post titled "Best CRM for Education
  Consultancy in Nepal", several of them from companies ranking their own
  product first. That format is cheap to publish and reads as what it is.
