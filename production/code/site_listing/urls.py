import json, sys, re
from urllib.parse import urljoin
for n in sys.argv[1:]:
    d = json.load(open(n + '.json')); us = set()
    for i in d['imgs']:
        if i.get('u'): us.add(i['u'])
        for part in (i.get('set') or '').split(','):
            p = part.strip().split(' ')[0]
            if p: us.add(p)
    us |= set(d['net'])
    us = [u for u in us if u.startswith('http') and not re.search(r'\.svg|icon|logo|sprite|favicon', u, re.I)]
    json.dump(sorted(us), open(n + '_urls.json', 'w')); print(n, len(us))
