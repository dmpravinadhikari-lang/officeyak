#!/usr/bin/env bash
#
# Copy last night's backup somewhere that is not this disk.
#
#   scripts/offsite.sh
#
# systemd runs this straight after the backup itself. Until it existed the
# service file carried a commented-out rclone line and a note saying "put your
# own command here", which nobody ever did, so every encrypted archive this
# product has ever written has sat on the same disk as the database it was
# protecting. That is not a backup, it is a second copy of the same accident.
#
# What makes this different from the commented-out line: it checks. rclone
# exits zero when it copies nothing at all, so a wrong remote name, an expired
# key or an empty backup directory all looked exactly like success. This reads
# the file back afterwards and compares its size, and fails the unit when the
# two do not match, because a backup you have not verified is a rumour.
#
# The remote is named by OFFICEYAK_BACKUP_REMOTE, in rclone's own form:
#
#   OFFICEYAK_BACKUP_REMOTE=r2:officeyak-backups
#
# Everything written here is already sealed with OFFICEYAK_BACKUP_KEY before it
# leaves, so whoever holds the bucket holds ciphertext. That is deliberate: the
# destination is the least trusted part of this and does not need to be trusted.
set -euo pipefail

DIR="${OFFICEYAK_BACKUP_DIR:-./data/backups}"
REMOTE="${OFFICEYAK_BACKUP_REMOTE:-}"
KEEP_DAYS="${OFFICEYAK_BACKUP_KEEP_DAYS:-90}"

if [ -z "$REMOTE" ]; then
  echo "!! OFFICEYAK_BACKUP_REMOTE is not set, so tonight's backup is staying on this disk."
  echo "!! Set it in /etc/officeyak/officeyak.env, for example: OFFICEYAK_BACKUP_REMOTE=r2:officeyak-backups"
  exit 1
fi

command -v rclone >/dev/null || { echo "!! rclone is not installed on this machine."; exit 1; }

LATEST=$(ls -1t "$DIR"/*.tar.gz.enc 2>/dev/null | head -1 || true)
[ -n "$LATEST" ] || { echo "!! No backup archive found in $DIR. Nothing to copy, which is itself wrong."; exit 1; }

NAME=$(basename "$LATEST")
LOCAL_SIZE=$(stat -c %s "$LATEST" 2>/dev/null || stat -f %z "$LATEST")

echo "==> copying $NAME ($LOCAL_SIZE bytes) to $REMOTE"
rclone copy "$LATEST" "$REMOTE" --no-traverse

# Read it back. This is the whole point of the script.
REMOTE_SIZE=$(rclone lsf "$REMOTE/$NAME" --format s 2>/dev/null | head -1 || true)
if [ -z "$REMOTE_SIZE" ]; then
  echo "!! $NAME is not at $REMOTE after the copy. The backup did NOT leave this machine."
  exit 1
fi
if [ "$REMOTE_SIZE" != "$LOCAL_SIZE" ]; then
  echo "!! $NAME arrived the wrong size: $REMOTE_SIZE there, $LOCAL_SIZE here. Treating that as a failure."
  exit 1
fi
echo "    verified: $NAME is at $REMOTE, $REMOTE_SIZE bytes"

# The retention promise in the privacy policy is about every copy, not just the
# one on this disk, so the remote is pruned to the same number of days.
rclone delete "$REMOTE" --min-age "${KEEP_DAYS}d" --include "*.tar.gz.enc" 2>/dev/null || true

# A receipt, so preflight and anyone reading the box can tell when a backup
# last actually reached safety rather than when one was last written.
date -u +"%Y-%m-%dT%H:%M:%SZ" > "$DIR/.last-offsite"
echo "    off-site copy finished"
