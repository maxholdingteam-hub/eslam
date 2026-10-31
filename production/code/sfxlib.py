"""sfxlib - tiny helper for the real-recording SFX library (48 kHz stereo, -1 dBTP).

    import sys; sys.path.insert(0, '<D>/lib/sfx'); import sfxlib
    x, meta = sfxlib.get('whoosh_short')            # best pick (rank 0)
    out = np.zeros((int(20 * 48000), 2), np.float32)
    sfxlib.place(out, 3.20, 'whoosh_short', align='peak', gain_db=-6)        # peak lands on the cut at 3.20 s
    sfxlib.place(out, 3.20, ('hit_heavy', 0), align='onset', gain_db=-3)     # hit starts exactly on 3.20 s
    sfxlib.place(out, 7.0, meta, vary=0.5, seed=4)  # +-0.5 semitone random repitch to avoid repetition

`entry` may be: a role string, (role, i), a catalog dict, or an (array, meta) tuple from get().
All times in seconds; anchor times come from catalog.json (peak_t / onset_t).
"""
import json, os, wave
import numpy as np

SR = 48000
ROOT = os.path.dirname(os.path.abspath(__file__))
_CAT = None
_CACHE = {}


def catalog():
    global _CAT
    if _CAT is None:
        with open(os.path.join(ROOT, 'catalog.json')) as f:
            _CAT = json.load(f)['entries']
    return _CAT


def roles():
    return sorted({e['role'] for e in catalog()})


def entries(role):
    return sorted([e for e in catalog() if e['role'] == role], key=lambda e: e['rank'])


def find(tag=None, role=None, group=None):
    return [e for e in catalog() if (tag is None or tag in e['tags']) and (role is None or e['role'] == role)
            and (group is None or e['group'] == group)]


def _read(path):
    if path not in _CACHE:
        with wave.open(os.path.join(ROOT, path)) as w:
            a = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32768.0
            _CACHE[path] = a.reshape(-1, w.getnchannels())
    return _CACHE[path]


def get(role, i=0):
    """Return (float32 array (n,2) @48 kHz, meta dict) for the i-th ranked pick of `role`."""
    es = entries(role)
    if not es:
        raise KeyError(f'no entries for role {role!r}; roles: {roles()}')
    e = es[min(i, len(es) - 1)]
    return _read(e['path']).copy(), e


def _resolve(entry):
    if isinstance(entry, str):
        return get(entry)
    if isinstance(entry, tuple) and len(entry) == 2 and isinstance(entry[0], str):
        return get(entry[0], entry[1])
    if isinstance(entry, tuple) and len(entry) == 2 and isinstance(entry[0], np.ndarray):
        return entry[0], entry[1]
    if isinstance(entry, dict):
        return _read(entry['path']).copy(), entry
    raise TypeError('entry must be role str, (role, i), catalog dict or (array, meta)')


def _resample(x, rate):
    """Varispeed by `rate` (>1 = higher & shorter) with linear interpolation (fine for +-1 semitone)."""
    n = len(x)
    m = max(2, int(round(n / rate)))
    src = np.arange(m) * rate
    src = np.minimum(src, n - 1)
    i0 = np.floor(src).astype(int); i1 = np.minimum(i0 + 1, n - 1); fr = (src - i0)[:, None].astype(np.float32)
    return x[i0] * (1 - fr) + x[i1] * fr


def place(out, t, entry, align='peak', gain_db=0.0, vary=0.0, semitones=None, seed=None, fade_out=None, max_len=None, pan=0.0):
    """Mix an effect into float32 stereo buffer `out` (n,2) @48 kHz so its peak_t (align='peak') or onset_t
    (align='onset' / 'start' = sample 0) lands exactly at time t (s).
    vary: random repitch range in semitones (+-vary); semitones: fixed repitch; both change length (varispeed),
    the anchor is rescaled so alignment stays exact. max_len/fade_out (s) shorten beds. pan: -1..1.
    Returns (start_sample, end_sample) actually written."""
    x, e = _resolve(entry)
    st = 0.0
    if semitones is not None:
        st = float(semitones)
    elif vary:
        st = float(np.random.default_rng(seed).uniform(-vary, vary))
    rate = 2 ** (st / 12)
    if abs(rate - 1) > 1e-6:
        x = _resample(x, rate)
    if max_len is not None and len(x) > int(max_len * SR):
        x = x[:int(max_len * SR)].copy(); fade_out = fade_out or 0.25
    if fade_out:
        n = min(len(x), int(fade_out * SR)); x[-n:] *= np.linspace(1, 0, n, dtype=np.float32)[:, None]
    x = x * np.float32(10 ** (gain_db / 20))
    if pan:
        x = x * np.array([min(1, 1 - pan), min(1, 1 + pan)], np.float32)
    anchor = {'peak': e['peak_t'], 'onset': e['onset_t'], 'start': 0.0}[align] / rate
    i = int(round((t - anchor) * SR))
    if i < 0:
        x = x[-i:]; i = 0
    m = min(len(x), len(out) - i)
    if m > 0:
        out[i:i + m] += x[:m]
    return i, i + max(m, 0)


def lead_time(entry, align='peak'):
    """Seconds between the file start and its anchor - i.e. how early the sound begins before t."""
    _, e = _resolve(entry)
    return e['peak_t'] if align == 'peak' else e['onset_t']
