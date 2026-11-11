#!/usr/bin/env bash
# scripts/prepare-hero-video.sh
# Prepares all-intra video assets for smooth hero scrubbing
set -euo pipefail

SRC="assets-src/hero-original.mp4"
OUT_DIR="public/video"
METHOD="${1:-cropzoom}" # "delogo" or "cropzoom" (default: cropzoom to eliminate smudge artifacts)

mkdir -p "$OUT_DIR"

# Resolve ffmpeg from ffmpeg-static or PATH
if [ -f "node_modules/ffmpeg-static/ffmpeg.exe" ]; then
  FFMPEG="node_modules/ffmpeg-static/ffmpeg.exe"
elif [ -f "node_modules/ffmpeg-static/ffmpeg" ]; then
  FFMPEG="node_modules/ffmpeg-static/ffmpeg"
else
  FFMPEG="ffmpeg"
fi

if [ "$METHOD" = "delogo" ]; then
  echo "Using delogo filter (x=1128:y=568:w=64:h=64)..."
  FILTER_DESKTOP="delogo=x=1128:y=568:w=64:h=64"
  FILTER_MOBILE="delogo=x=1128:y=568:w=64:h=64,scale=720:-2"
else
  echo "Using slight zoom and crop fallback (removes watermark cleanly with zero smudge artifacts)..."
  FILTER_DESKTOP="crop=1200:675:0:0,scale=1280:720"
  FILTER_MOBILE="crop=1200:675:0:0,scale=720:-2"
fi

echo "Encoding desktop all-intra hero video (target <= 8 MB)..."
"$FFMPEG" -y -i "$SRC" \
  -an \
  -vf "$FILTER_DESKTOP" \
  -c:v libx264 -g 1 -pix_fmt yuv420p -movflags +faststart -crf 23 \
  "$OUT_DIR/hero.mp4"

echo "Encoding mobile all-intra hero video (target <= 4 MB)..."
"$FFMPEG" -y -i "$SRC" \
  -an \
  -vf "$FILTER_MOBILE" \
  -c:v libx264 -g 1 -pix_fmt yuv420p -movflags +faststart -crf 24 \
  "$OUT_DIR/hero-mobile.mp4"

echo "Extracting first frame as poster..."
"$FFMPEG" -y -ss 00:00:00 -i "$OUT_DIR/hero.mp4" \
  -frames:v 1 -q:v 2 \
  "$OUT_DIR/hero-poster.jpg"

echo ""
echo "=== Hero Video Preparation Complete ==="
echo "Method: $METHOD"
ls -lh "$OUT_DIR"/hero*
