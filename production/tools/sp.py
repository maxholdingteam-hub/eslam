import subprocess,sys
def splice(orig,a,b,ins,i0,i1,out,fit=None):
    # orig[0:a] + ins[i0:i1] (optionally tempo-fit to 'fit' sec) + orig[b:]
    tempo=''
    if fit: tempo=f',atempo={(i1-i0)/fit:.4f}'
    fc=(f"[0:a]atrim=0:{a},asetpts=N/SR/TB,aresample=44100,afade=t=out:st={a-0.02}:d=0.02[x];"
        f"[1:a]atrim={i0}:{i1},asetpts=N/SR/TB,aresample=44100{tempo},afade=t=in:d=0.02[y];"
        f"[0:a]atrim={b},asetpts=N/SR/TB,aresample=44100,afade=t=in:d=0.02[z];[x][y][z]concat=n=3:v=0:a=1[o]")
    r=subprocess.run(['ffmpeg','-v','error','-y','-i',orig,'-i',ins,'-filter_complex',fc,'-map','[o]','-b:a','192k',out],capture_output=True,text=True);print(r.stderr)
