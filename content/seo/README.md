# What the SEO agent writes here

`latest.json` is the most recent run of any cadence. `history/<date>-<kind>.json`
is a copy of each run, kept so a month can be read back without a database.

The shape is defined in `src/modules/seo/report.ts`, and the admin Marketing
tab reads it. Read the type rather than copying an old file: a field the page
does not know about is a field nobody sees.

Nothing writes here by hand. The directory is empty until the first scheduled
run reports, and the Marketing tab says so in words rather than drawing an
empty dashboard.

Two rules the playbooks state and this file repeats because they are the ones
that matter: never write a figure that was not measured, since every block is
optional and a missing block renders as "not measured" while a zero renders as
an answer; and `site.unreachable` is not `site.up: false`, because a network
policy refusing the host is not an outage and must never be reported as one.
