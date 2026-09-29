#!/usr/bin/env bash
#
# Deploy OfficeYak without taking the site down if something goes wrong.
#
#   /srv/officeyak/deploy/deploy.sh
#
# The old build keeps serving while the new one compiles. Only when the build
# succeeds is it swapped in and the service restarted, so a failed build, a
# dropped connection or a cancelled terminal leaves the site exactly as it
# was, running the previous version.
#
# Before this existed the sequence was stop, build, start. A build interrupted
# halfway left .next missing its prerender manifest and the site returning 502
# until somebody noticed.
set -euo pipefail

APP=/srv/officeyak
cd "$APP"

echo "==> fetching"
git fetch -q origin main
git reset -q --hard origin/main
echo "    now at $(git log --oneline -1)"

set -a; . /etc/officeyak/officeyak.env; set +a
export NODE_ENV=production

# The full output of both steps is kept, because the one time you need it is
# the time the deploy failed and the summary told you nothing.
LOG=/var/log/officeyak-deploy.log
: > "$LOG"

echo "==> installing any new dependencies"
# --include=dev is not optional: NODE_ENV=production is exported above, npm
# honours it by skipping devDependencies, and next.config.ts is TypeScript, so
# the build cannot even read its own config without the typescript package.
#
# install rather than ci. npm ci was reporting that it had added 86 packages
# and leaving six directories behind, with no react, no typescript and no
# next binary, and exiting zero while it did so. install self heals from that
# state; ci does not, and a deploy step that lies about succeeding is worse
# than a slower one that does not.
npm install --include=dev --no-audit --no-fund >>"$LOG" 2>&1 || { echo "!!  npm install failed:"; tail -25 "$LOG"; exit 1; }

# Trust nothing: check the binary the next line is about to call.
[ -x node_modules/.bin/next ] || { echo "!!  dependencies incomplete, next binary missing. Site untouched."; exit 1; }
tail -2 "$LOG"

echo "==> building into a scratch directory, the site stays up"
rm -rf .next-build
mkdir -p .next-build

# Carry the previous build's cache across.
#
# Without this every deploy starts from an empty cache, which means next/font
# re-downloads the Google Fonts on every single build. That made builds three
# times slower and, worse, made every deploy depend on a network fetch
# succeeding: one hiccup and the build died with
# "An error occurred in next/font: Cannot read properties of null".
# The cache is Next's own and is safe to reuse across builds of the same app.
if [ -d .next/cache ]; then
  cp -r .next/cache .next-build/cache
fi
build_once() {
  OFFICEYAK_DIST_DIR=.next-build npm run build >>"$LOG" 2>&1
}

if ! build_once; then
  # One retry, because the failure this guards against is a network one and it
  # is transient.
  #
  # On a cold cache next/font fetches the Google Fonts during the build. When
  # that fetch comes back empty or truncated the build dies parsing it, with
  # "Unexpected end of JSON input" and no stack trace into our own code, and
  # then next-font-manifest.json is missing because the build never got that
  # far. The cache carried across above is what normally stops this happening
  # at all; this is for the deploy where there was no cache to carry.
  #
  # Retrying costs a minute on a genuinely broken build and saves a deploy
  # that would otherwise have failed for a reason nothing in the repository
  # is wrong about. The durable fix is to self host the fonts so the build
  # reaches the network zero times, which is a change to the font pipeline
  # rather than to this script.
  echo "!!  build failed, retrying once in case it was the font fetch"
  rm -rf .next-build
  mkdir -p .next-build
  [ -d .next/cache ] && cp -r .next/cache .next-build/cache

  if ! build_once; then
    echo "!!  build failed twice. The site is still on the old version. Last of $LOG:"
    tail -30 "$LOG"
    rm -rf .next-build
    exit 1
  fi
  echo "    the retry succeeded, so the first failure was transient"
fi
grep -E "✓ Compiled|✓ Generating" "$LOG" | tail -2

# A build that did not produce this file is not a build. Checking for it is
# what makes the swap safe rather than hopeful.
if [ ! -f .next-build/prerender-manifest.json ]; then
  echo "!!  build incomplete, nothing swapped. The site is still on the old version."
  rm -rf .next-build
  exit 1
fi

echo "==> swapping in the new build"
rm -rf .next-previous
[ -d .next ] && mv .next .next-previous
mv .next-build .next
chown -R officeyak:officeyak "$APP"

echo "==> restarting"
systemctl restart officeyak
sleep 8

if [ "$(systemctl is-active officeyak)" = "active" ] \
   && [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 http://127.0.0.1:3030/)" = "200" ]; then
  echo "==> live: $(git log --oneline -1)"
  rm -rf .next-previous
else
  echo "!!  the new build will not serve. Rolling back."
  systemctl stop officeyak || true
  rm -rf .next
  mv .next-previous .next
  chown -R officeyak:officeyak "$APP"
  systemctl start officeyak
  echo "!!  rolled back to the previous build. Read: journalctl -u officeyak -n 40"
  exit 1
fi
