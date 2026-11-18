# poll.sh listfile dir ext
while true; do L=$(timeout 60 higgsfield generate list 2>&1); left=0
 while read k id; do [ -s $2/$k.$3 ] && continue; line=$(echo "$L" | grep "$id"); u=$(echo "$line" | grep -o "https://[^ ]*\.$3")
  if [ -n "$u" ]; then curl -s -o $2/$k.$3 "$u"; echo "$k ready"; elif echo "$line" | grep -qiE "failed|nsfw|cancel"; then echo "$k FAILED"; touch $2/$k.$3.fail; else left=1; fi
 done < $1; [ $left = 0 ] && break; sleep 20; done
