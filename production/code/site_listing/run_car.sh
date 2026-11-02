# run_car.sh BRAND NAME KEEPSET "e1 e2@scale@plbox ..." "+i1 i2 ..."   (+i = swap the window view for the studio backdrop)
B=$1; N=$2; K=$3; E=$4; I=$5
pick() { python3 -c "import json;print('/tmp/mmw/lst/'+json.load(open('/tmp/mmw/lst/${K}_keep.json'))[$1][0])"; }
args=""
for i in $E; do s=${i%%@*}; sc=""; [ "$s" != "$i" ] && sc="@${i#*@}"; args="$args ext:$(pick $s)$sc"; done
for i in $I; do r=""; case $i in +*) r="+"; i=${i#+};; esac; args="$args int:$r$(pick $i)"; done
cd /tmp/mmw/lst && python3 /home/user/eslam/production/code/site_listing/make_car.py /home/user/eslam/MaxMotors_Site_Listings/$B/$N $N $args | tail -2
