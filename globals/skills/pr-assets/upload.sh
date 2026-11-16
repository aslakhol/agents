#!/usr/bin/env bash
# Upload a file to pr-assets and print its public URL and a markdown snippet.
# Usage: upload.sh <file>
set -euo pipefail

BUCKET=konfidens-pr-assets
REGION=eu-central-1

file=${1:?usage: upload.sh <file>}
env_file="$(dirname "$0")/.env"
[ -f "$env_file" ] && . "$env_file"
if [ -z "${PR_ASSETS_KEY:-}" ]; then
  cat >&2 <<EOF
PR_ASSETS_KEY is not set. Create $env_file with:

  echo 'PR_ASSETS_KEY=ACCESS_KEY_ID:SECRET' > $env_file && chmod 600 $env_file
EOF
  exit 1
fi

name=$(basename "$file" | tr -c 'A-Za-z0-9._\n-' '-')
type=$(file --mime-type -b "$file")
url="https://$BUCKET.s3.$REGION.amazonaws.com/$(openssl rand -hex 8)/$name"

curl --fail-with-body -sS -X PUT --upload-file "$file" \
  --aws-sigv4 "aws:amz:$REGION:s3" --user "$PR_ASSETS_KEY" \
  -H "Content-Type: $type" \
  -H "x-amz-content-sha256: UNSIGNED-PAYLOAD" \
  "$url"

echo "$url"
case "$type" in
  image/*) echo "![$name]($url)" ;;
  *) echo "[$name]($url)" ;;
esac
