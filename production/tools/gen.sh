#!/bin/bash
# gen.sh NAME ASPECT PROMPTFILE REF... : runs higgsfield gpt_image_2_6, writes NAME.out (url) and NAME.png
name=$1; ar=$2; pf=$3; shift 3
args=()
for r in "$@"; do args+=(--image "$r"); done
timeout 900 higgsfield generate create gpt_image_2_6 --prompt "$(cat "$pf")" --aspect_ratio "$ar" --quality high --resolution 2k "${args[@]}" --wait > "$name.out" 2>&1
url=$(grep -o 'https://[^ ]*\.png' "$name.out" | tail -1)
[ -n "$url" ] && curl -s -m 120 -o "$name.png" "$url"
echo "$name done: $url"
