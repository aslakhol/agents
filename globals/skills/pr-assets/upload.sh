#!/usr/bin/env bash
# Upload a file to pr-assets and print its public URL and a markdown snippet.
# Usage: upload.sh <file>
set -euo pipefail

BUCKET=konfidens-pr-assets
REGION=eu-central-1

file=${1:?usage: upload.sh <file>}
: "${PR_ASSETS_KEY:?PR_ASSETS_KEY is not set (format ACCESS_KEY_ID:SECRET)}"

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
