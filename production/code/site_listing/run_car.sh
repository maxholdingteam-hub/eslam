# run_car.sh BRAND NAME KEEPSET "e1 e2 e3 e4" "i1 i2 ..."
B=$1; N=$2; K=$3; E=$4; I=$5
args=""
for i in $E; do s=${i%%@*}; sc=""; [ "$s" != "$i" ] && sc="@${i#*@}"; args="$args ext:$(python3 -c "import json;print(json.load(open('/tmp/mmw/lst/${K}_keep.json'))[$s][0])")$sc"; done
for i in $I; do args="$args int:$(python3 -c "import json;print(json.load(open('/tmp/mmw/lst/${K}_keep.json'))[$i][0])")"; done
cd /tmp/mmw/lst && python3 /home/user/eslam/production/code/site_listing/make_car.py /home/user/eslam/MaxMotors_Site_Listings/$B/$N $N $args | tail -1
