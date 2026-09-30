# The prompt for setting this up on another site

Paste the block below into a session working on the other site's repository.
It is written for Sprout Education; for a third client, change the facts in
"What this client is" and delete anything that does not apply.

It is long on purpose. Everything in it was learned by getting it wrong on
OfficeYak first, and a session that has to rediscover any of it will spend an
afternoon doing so.

---

```
Set up the daily SEO routine system on this site, the way it works on
OfficeYak. Do not design it from scratch: it exists, it is deployed, and this
is a port plus the pieces this repo is missing.

## What this client is

Sprout Education. Repo git@github.com:dmpravinadhikari-lang/sprouteducation.git,
deployed at /srv/sprout on the Contabo VPS 13.140.133.16, served by
sprout.service behind the nginx site "sprout". Domains on Cloudflare:
sprouteducationconsultancy.com is active, sprout.edu.np is still
initializing. Same Cloudflare account and same Google account as OfficeYak.

Read docs/routines/sprouteducation.md before anything else. A brief already
exists and is the authority on what this client is, who buys from it, what you
may change and what you must never touch. If it is thin, filling it in is the
first job, because everything else reads from it.

## What is already here

- docs/routines/ with a brief and three playbooks, copied from OfficeYak at
  some earlier point. Check them against OfficeYak's current ones: they are
  behind, and at minimum they are missing the daily "Did yesterday's page
  land" section and the instruction to write an `indexing` block.

## What to port from OfficeYak

Read these from the officeyak repo and adapt them. Do not copy blindly, adapt
to this client's brief.

- src/modules/seo/report.ts        the report contract the tab reads
- src/app/app/admin/marketing/     the Marketing tab, admin-gated
- content/seo/README.md            plus an empty history/ directory
- deploy/deploy.sh                 the zero-downtime deploy
- docs/routines/playbook-*.md      refresh against current OfficeYak versions

Wire the Marketing tab into whatever this app's admin console is. On OfficeYak
it sits behind requireCapability("platform:admin") and is deliberately not in
the customer-facing navigation, because it is the platform owner's view of the
business rather than anything a customer should see.

## Decisions already made. Do not relitigate these.

1. Three routines, not one: daily at 06:00, weekly Monday 07:00, monthly 1st
   07:00, all Kathmandu, which is UTC+5:45. The daily run must be fast and
   boring or it stops being trusted. Analysis lives in the weekly run because
   search position does not change overnight, and looking at it daily produces
   noise that tempts you into editing pages that were working.

2. Brief plus playbook, not one file per client. The brief holds facts about
   one client. The playbook holds procedure and names nobody. Adding a client
   is a brief plus three routines whose prompt points at it.

3. The autonomy line: the agent may change content and marketing pages without
   asking, and may never touch product code, auth, payments or the database.
   The test for whether a fix is the agent's to make is whether a person
   looking at the page in a browser would see any difference. A missing alt
   attribute is mechanical; a colour is not. This is not about the agent's
   judgement being poor, it is so the owner can trust the site did not change
   shape overnight without anyone deciding it should.

4. The report is a JSON file in the repo, not a database row. The agent runs
   in the cloud and cannot reach the server's database, and the only way to let
   it would be to put a production secret inside a cloud agent. A file can be
   read, diffed and reverted.

5. Never show a number the agent did not measure. Every block in the report is
   optional. A missing block renders as "not measured"; a zero renders as an
   answer, and someone will believe it. `site.unreachable` and
   `site.up: false` are different fields with different banners, because
   telling the owner the site is down when a proxy merely refused the host is
   the worst thing this system can do.

6. The daily run gets exactly one Search Console check: whether yesterday's
   page is indexed. Not indexed after a day is ordinary. After a week it means
   something, and the causes worth checking in order are: not in the sitemap,
   blocked by robots, canonical points elsewhere, nothing links to it. The last
   is the most commonly missed.

## Traps. Each of these cost real time on OfficeYak.

Deploy:
- deploy.sh must re-exec itself from a snapshot in /tmp. It runs
  git reset --hard, which rewrites the script while bash is still reading it
  by byte offset, and every later line then comes from the wrong place.
- npm install --include=dev, not npm ci. NODE_ENV=production makes npm skip
  devDependencies, and next.config.ts cannot be read without typescript. npm ci
  also silently produced a broken tree once and exited zero while doing it.
- Carry .next/cache into the scratch build directory. Without it next/font
  re-downloads the Google Fonts every build, which triples build time and makes
  every deploy depend on a network fetch. When that fetch returns truncated the
  build dies on "Unexpected end of JSON input" with no stack trace into your
  own code. Retry the build once for exactly this reason.
- flock the whole script. main auto-deploys from cron and people run it by
  hand; two overlapping deploys share one scratch directory and the second dies
  with ENOENT on a file the first moved.
- Verify builds with a separate dist directory, not .next, or you break the dev
  server another session is using. OfficeYak uses OFFICEYAK_DIST_DIR.

Cloudflare:
- Email Routing is not in the zone's left menu any more. It lives under a
  separate "Email Service" section. Go straight to
  dash.cloudflare.com/<account id>/email-service/routing/<zone id>/overview
- Enabling Email Routing writes an SPF record saying only Cloudflare may send
  mail for the domain. If the site sends transactional email through Brevo or
  anything else, that record starts pushing its own password resets into spam.
  Merge the includes into one record immediately after enabling:
  v=spf1 include:_spf.mx.cloudflare.net include:spf.brevo.com ~all
- A destination address must be confirmed by someone clicking a link in that
  inbox. Nothing routes until then and you cannot do it for them.

Google:
- The service account key goes in the cloud environment's Environment
  variables, NOT API credentials. API credentials is for bearer tokens and
  custom headers; a service account key has to sign a JWT and exchange it for
  a short-lived token, which that box cannot do.
- Base64 the key onto one line. The env box is one line per value and the key
  is pretty-printed JSON full of quotes and embedded newlines. Encoding
  sidesteps the quoting question rather than answering it badly.
- Move it via the clipboard, never through the conversation:
  base64 -i key.json | tr -d '\n' | pbcopy, then paste. Clear the clipboard and
  delete the file afterwards.
- Search Console permission: Restricted, not Full. Full can submit sitemaps and
  request URL removals and nothing in these playbooks does either.
- GA4: Viewer, and untick "Notify new users by email". A service account has no
  inbox.
- Restrict the PageSpeed key to the PageSpeed Insights API alone so it is
  useless for anything else if it leaks.
- Network access on the cloud environment must be Full, not Trusted. Trusted
  refuses the site itself and every run stops at step one reporting a 403 from
  the egress proxy. Custom is tighter but the monthly run checks figures
  against government sites across many countries and an allowlist silently
  blocks most of them.

Working alongside other sessions:
- git add explicit paths, never -A. This tree is shared and -A has already
  swept another session's uncommitted work into a commit.
- Run git log origin/main..main before pushing. If main auto-deploys, pushing
  also publishes anyone else's unpushed commits, including ones waiting for
  approval.

## What needs the owner, and how to ask

He is not technical and has said so. Ask one thing at a time, give the exact
clicks, and say what each thing unlocks and how he will know it worked. Do not
send him a list of six things at once.

Things only he can do:
- Confirm the destination inbox for email forwarding by clicking a link.
- Decide whether main should auto-deploy, knowing it publishes whatever lands
  there from anyone.
- Anything involving a payment, a contract term, or a legal page.

Things you can do in his browser if he asks: he has Claude in Chrome connected
and has been happy for it to be driven, including Cloudflare, Google Cloud,
Search Console and Analytics.

## Order of work

1. Read the brief. Fill its gaps before anything else.
2. Port deploy.sh and confirm a deploy works and rolls back.
3. Port the report module, the Marketing tab and content/seo.
4. Refresh the three playbooks against OfficeYak's current versions.
5. Create the three routines pointing at this client's brief.
6. Network access to Full, then verify with one manual run.
7. Credentials, one at a time, in this order: Search Console and Analytics
   first because they are what make the weekly run worth running, then
   PageSpeed, then anything else.
8. Email forwarding last unless the legal pages already name addresses that
   bounce, in which case it is first.

## House rules for anything you write

No em dashes. Never invent a figure. Never claim a feature without finding it
in the code first. Answer the question in the first two or three sentences
under the heading that asks it, because that is how both Google and every AI
search tool read a page.
```
