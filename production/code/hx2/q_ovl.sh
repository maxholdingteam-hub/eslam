#!/bin/bash
# 4K transparent graphics layer, 4 workers
R=/tmp/claude-0/-home-user-eslam/0f5505b8-8bf4-57e7-9c4a-28493f9f4c64/reg; cd $R
N=${1:-3690}; q=$(( (N+3)/4 )); mkdir -p hx2/ovl; : > hx2/ovl_pids
for i in 0 1 2 3; do a=$((i*q)); b=$(( (i+1)*q < N ? (i+1)*q : N )); FMT=png DSF=2 PAGE="film.html?car=hilux27&json=film2.json&layer=ovl" nice node render.js range hx2/ovl 60 $a $b > hx2/ovl_$i.log 2>&1 & echo $! >> hx2/ovl_pids; done
for p in $(cat hx2/ovl_pids); do while kill -0 $p 2>/dev/null; do sleep 10; done; done
echo "ovl done $(ls hx2/ovl | wc -l)"
