# Replace some shots of a finished 4K film without re-rendering the rest:
#   python3 patch.py <film.json> <car> <final.mp4> <out.mp4> <shot idx,...> [target_MB=95]
# Each listed shot is rebuilt (graded footage + vignette/grain + its graphics frames, exactly like compose.sh),
# the untouched spans are cut frame-exact from <final.mp4>, everything is re-joined in one 2-pass x264 encode,
# and the original audio stream is copied.
import json, os, subprocess, sys
H2 = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(H2)
film, car, src, out, idx = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sorted(map(int, sys.argv[5].split(',')))
MB = float(sys.argv[6]) if len(sys.argv) > 6 else 95
C = json.load(open(film)); FPS = 60
def run(cmd, **k):
    r = subprocess.run(cmd, capture_output=True, text=True, **k)
    if r.returncode: print(r.stderr[-1500:]); sys.exit(1)
    return r.stdout
N = int(run(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', src]).strip())
os.makedirs(f'{H2}/patch', exist_ok=True)
REUSE = os.environ.get('REUSE')   # keep already-built patch clips (p<i>.mp4) from an interrupted run
if not REUSE: run(['python3', f'{H2}/shots.py', film, ','.join(map(str, idx))], env={**os.environ, 'NOCONCAT': '1'})
FG = "[0:v]vignette=angle=0.62:mode=forward,noise=alls=3:allf=t[b];[1:v]format=rgba[o];[b][o]overlay=0:0:format=auto:shortest=1,format=yuv420p[v]"
spans = []
for i in idx:
    s = C['shots'][i]; a, b = round(s['t0'] * FPS), round(s['t1'] * FPS); od = f'{H2}/patch/ovl{i}'
    if REUSE and os.path.exists(f'{H2}/patch/p{i}.mp4'): spans.append((a, b, i)); continue
    os.makedirs(od, exist_ok=True)
    run(['node', f'{R}/render.js', 'range', od, str(FPS), str(a), str(b)], cwd=R,
        env={**os.environ, 'FMT': 'png', 'DSF': '2', 'PAGE': f'film.html?car={car}&json=film.json&layer=ovl'})
    run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'{H2}/seg/s{i:02d}.mp4', '-framerate', str(FPS), '-start_number', str(a), '-i', f'{od}/f%05d.png',
         '-filter_complex', FG, '-map', '[v]', '-frames:v', str(b - a), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '12', '-r', str(FPS), f'{H2}/patch/p{i}.mp4'])
    spans.append((a, b, i))
# filter graph: original frames outside the patched spans (each read by its own seeking input, so nothing is buffered)
# + the patched clips, in order
parts, inputs, cur, k = [], [], 0, 0
def orig(f0, f1):
    global k
    inputs.extend(['-ss', f'{f0 / FPS:.6f}', '-i', src]); parts.append(f"[{k}:v]trim=end_frame={f1 - f0},setpts=PTS-STARTPTS,setsar=1[s{len(parts)}]"); k += 1
for a, b, i in spans:
    if a > cur: orig(cur, a)
    inputs.extend(['-i', f'{H2}/patch/p{i}.mp4']); parts.append(f"[{k}:v]setpts=PTS-STARTPTS,setsar=1[s{len(parts)}]"); k += 1; cur = b
if cur < N: orig(cur, N)
inputs.extend(['-i', src]); AUD = k
fc = ';'.join(parts) + ';' + ''.join(f'[s{j}]' for j in range(len(parts))) + f'concat=n={len(parts)}:v=1:a=0,format=yuv420p[v]'
dur = N / FPS; VB = int((MB * 8 * 1024 * 1024 / dur - 256000) / 1000)
enc = ['-c:v', 'libx264', '-preset', 'slow', '-tune', 'film', '-profile:v', 'high', '-level', '5.2', '-b:v', f'{VB}k', '-maxrate', f'{VB * 2}k', '-bufsize', f'{VB * 3}k', '-r', str(FPS)]
tmp = f'{H2}/patch'
run(['nice', 'ffmpeg', '-nostdin', '-v', 'error', '-y', *inputs, '-filter_complex', fc, '-map', '[v]', '-frames:v', str(N), *enc, '-pass', '1', '-passlogfile', f'{tmp}/x264', '-an', '-f', 'mp4', '/dev/null'])
run(['nice', 'ffmpeg', '-nostdin', '-v', 'error', '-y', *inputs, '-filter_complex', fc, '-map', '[v]', '-map', f'{AUD}:a', '-frames:v', str(N), *enc, '-pass', '2', '-passlogfile', f'{tmp}/x264', '-c:a', 'copy', '-movflags', '+faststart', out])
print('patched', [i for _, _, i in spans], 'frames', N, 'MB', round(os.path.getsize(out) / 1048576, 1))
