#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
STAMP="${1:-$(date +%Y-%m-%d)}"
PACKAGE_NAME="liquid-universe-next-handoff-${STAMP}"
BUILD_PARENT="$ROOT_DIR/handoff/.package-build"
BUILD_DIR="$BUILD_PARENT/$PACKAGE_NAME"
ARTIFACT_DIR="$ROOT_DIR/handoff/artifacts"
LIST_FILE="$ROOT_DIR/handoff/liquid-universe-next/reusable-files.txt"

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR" "$ARTIFACT_DIR"

copy_path() {
  local path="$1"
  if [ ! -e "$ROOT_DIR/$path" ]; then
    echo "Missing reusable path: $path" >&2
    exit 1
  fi
  if [ -d "$ROOT_DIR/$path" ]; then
    mkdir -p "$BUILD_DIR/$path"
    rsync -a "$ROOT_DIR/$path/" "$BUILD_DIR/$path/"
  else
    mkdir -p "$(dirname "$BUILD_DIR/$path")"
    rsync -a "$ROOT_DIR/$path" "$BUILD_DIR/$path"
  fi
}

while IFS= read -r path; do
  if [ -z "$path" ] || [[ "$path" == \#* ]]; then
    continue
  fi
  copy_path "$path"
done < "$LIST_FILE"

mkdir -p "$BUILD_DIR/handoff"
rsync -a "$ROOT_DIR/handoff/liquid-universe-next/" "$BUILD_DIR/handoff/"

tar -C "$BUILD_PARENT" -czf "$ARTIFACT_DIR/$PACKAGE_NAME.tar.gz" "$PACKAGE_NAME"
rm -rf "$BUILD_PARENT"

echo "$ARTIFACT_DIR/$PACKAGE_NAME.tar.gz"
