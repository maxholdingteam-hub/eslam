#!/bin/bash
# usage: sfx.sh out.wav CUT END CHIPS SFXDIR
OUT=$1; CUT=$2; END=$3; CH=$4; X=$5
EV=( "glitch/UIGlitch_Futuristic_Machines_Devices_Glitch_15_Ocular_Sounds_Sci.wav|0.2|1.0"
"pop/Pop.mp3|0.29|0.6" "pop/Pop 2.mp3|0.38|0.6" "pop/Pop.mp3|0.47|0.6" "pop/Pop 3.mp3|0.56|0.6"
"gear/GearMetal_AP1.463.mp3|0.85|1.0"
"glitch/Hitech GUI.mp3|1.35|0.8"
"pop/Bubble Effect.mp3|1.65|0.8" "pop/Bubble Effect 2.mp3|1.78|0.8" "pop/Bubble Effect.mp3|1.91|0.8"
"gear/roling.mp3|2.5|0.6"
"bell/ding-small-bell-sfx-411945.mp3|3.3|1.0" )
for i in $(seq 0 $((CH-1))); do EV+=("pop/Pop 2.mp3|$(python3 -c "print(3.8+$i*0.15)")|0.7"); done
EV+=("rizer/TOOLHand_Low_Rise_and_Hit,_Scissors_1_Ocular_Sounds_Cinematic_Mechanics.wav|$(python3 -c "print($CUT-4.657)")|0.8"
"pop/Bubble Effect.mp3|$(python3 -c "print($CUT+0.15)")|0.8" "pop/Bubble Effect 2.mp3|$(python3 -c "print($CUT+0.3)")|0.8"
"glitch/UIGlitch_Futuristic_Machines_Devices_Glitch_2_Ocular_Sounds_Sci.wav|$(python3 -c "print($END-0.1)")|1.0"
"bell/little-bell-14606.mp3|$(python3 -c "print($END+0.1)")|0.8" "pop/Pop 2.mp3|$(python3 -c "print($END+0.5)")|0.8")
ARGS=(); F=""; n=0
for e in "${EV[@]}"; do IFS='|' read f t v <<<"$e"; ARGS+=(-i "$X/$f"); ms=$(python3 -c "print(max(0,int($t*1000)))"); F+="[$n:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=$v,adelay=${ms}|${ms}[a$n];"; n=$((n+1)); done
M=""; for i in $(seq 0 $((n-1))); do M+="[a$i]"; done
ffmpeg -v error -y "${ARGS[@]}" -filter_complex "${F}${M}amix=inputs=$n:normalize=0,alimiter=limit=0.9,apad,atrim=0:13[a]" -map "[a]" "$OUT"
