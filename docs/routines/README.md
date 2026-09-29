# The routine system

A scheduled agent that runs SEO for a website without being supervised.

There are two kinds of file here and the split is the whole idea:

- **A brief** is everything true about one client: the domain, the repo, who
  buys the product, the competitors, and what the agent is and is not allowed
  to touch. One file per client.
- **A playbook** is the procedure, and it is the same for every client. It
  never names a client. It reads whichever brief it was pointed at.

Adding a client is therefore two steps and no new thinking: write a brief, and
create a routine whose prompt points at that brief plus a playbook.

```
docs/routines/
  README.md              this file
  _client-template.md    copy this to start a new client
  officeyak.md           the worked example, and the live one
  playbook-daily.md      runs every morning
  playbook-weekly.md     runs Monday
  playbook-monthly.md    runs on the 1st
```

## Adding a client

1. Copy `_client-template.md` to `docs/routines/<client>.md` and fill it in.
   Every heading in it matters. An empty section makes the agent guess, and a
   guessing agent publishes wrong things politely.
2. If the client lives in a different repository, copy this whole `docs/routines`
   folder into it. The playbooks are deliberately self contained so that
   copying them is the only coupling between clients.
3. Create three routines pointing at that brief. The prompt is always the same
   two lines:

   > Read `docs/routines/<client>.md`, then read `docs/routines/playbook-daily.md`,
   > and do exactly what the playbook says for that client. The brief and the
   > playbook together are the full instructions for this run and they outrank
   > anything you assume.

   Change `daily` to `weekly` or `monthly` for the other two.

## Why three routines and not one

The daily run has to be fast and boring or it stops being trusted, and a run
that tries to do everything fails halfway and leaves a mess behind. So the work
is split by how often the underlying facts actually change.

| Routine | When | What it is for |
| --- | --- | --- |
| Daily | 06:00 | Is the site healthy, fix what is mechanical, publish one page |
| Weekly | Monday 07:00 | Read the data, decide what to write next, check competitors properly |
| Monthly | 1st, 07:00 | Re-verify every figure, prune what is not working, re-rank the queue |

Search position data does not change meaningfully overnight. Looking at it
daily produces noise and tempts you into changing pages that were working.
That is why the analysis sits in the weekly run and not the daily one.

## The autonomy rule

The agent may change **content and marketing pages** without asking. It may
never change **product code**. That line is drawn explicitly in each brief and
it is the single most important thing in this system.

The reason it is safe to let it publish unsupervised is not that it is careful.
It is that `deploy/deploy.sh` builds into a scratch directory, refuses to swap
in a build that did not complete, verifies the site returns 200 afterwards, and
rolls back to the previous build if it does not. A bad commit costs a minute of
build time. It does not cost an outage.

Remove that safety net and none of this should run unattended.

## The gap between pushing and publishing

The daily run writes a guide, commits it and pushes to `main`. On its own that
puts the post on GitHub and no further: something has to deploy it.

The routine deliberately does not reach into the server to do that, because the
only way to let it would be to put an SSH key for a production box inside a
cloud agent. The server should watch instead, so that the agent holds nothing
it could leak: a timer that polls `origin/main` every few minutes and runs
`deploy/deploy.sh` when it moves.

Installing that timer is a deliberate act with a consequence worth
understanding, so it is the owner's to perform rather than something a session
sets up quietly: once it is on, **anything that lands on `main` goes live,
whoever pushed it.** Everyone working on the repo should know that before it is
switched on. `deploy.sh` still rolls back a build that will not serve, so the
failure mode is a minute of build time rather than an outage, but a wrong page
that builds fine will publish itself.

Until it is installed, the daily run still does everything else; the page it
writes simply waits on `main` until someone deploys.
