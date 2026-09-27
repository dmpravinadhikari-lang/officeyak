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
npm ci --no-audit --no-fund >>"$LOG" 2>&1 || { echo "!!  npm ci failed:"; tail -25 "$LOG"; exit 1; }
tail -2 "$LOG"

echo "==> building into a scratch directory, the site stays up"
rm -rf .next-build
if ! OFFICEYAK_DIST_DIR=.next-build npm run build >>"$LOG" 2>&1; then
  echo "!!  build failed. The site is still on the old version. Last of $LOG:"
  tail -30 "$LOG"
  rm -rf .next-build
  exit 1
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
