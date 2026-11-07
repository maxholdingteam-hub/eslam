#!/bin/bash
# re-render graphics frames whose captions moved to the recorded VO
R=/tmp/claude-0/-home-user-eslam/0f5505b8-8bf4-57e7-9c4a-28493f9f4c64/reg; cd $R; : > hx2/fix_pids
P="film.html?car=hilux27&json=film2.json&layer=ovl"
( FMT=png DSF=2 PAGE="$P" nice node render.js range hx2/ovl 60 732 781; FMT=png DSF=2 PAGE="$P" nice node render.js range hx2/ovl 60 1164 1255 ) > hx2/fix_0.log 2>&1 & echo $! >> hx2/fix_pids
for r in "2148 2332" "2332 2516" "2516 2701"; do set -- $r; FMT=png DSF=2 PAGE="$P" nice node render.js range hx2/ovl 60 $1 $2 > hx2/fix_$1.log 2>&1 & echo $! >> hx2/fix_pids; done
for p in $(cat hx2/fix_pids); do while kill -0 $p 2>/dev/null; do sleep 5; done; done
echo "fix done $(ls hx2/ovl | wc -l)"
