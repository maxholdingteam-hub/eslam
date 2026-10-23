import qrcode,sys
WA='M16 3C8.8 3 3 8.7 3 15.8c0 2.5.7 4.9 2 7L3 29l6.4-2a13 13 0 0 0 6.6 1.8C23.2 28.8 29 23 29 15.8S23.2 3 16 3zm7.5 18c-.3.9-1.8 1.7-2.5 1.8-.7.1-1.5.2-4.6-1-3.9-1.6-6.4-5.5-6.6-5.8-.2-.3-1.5-2-1.5-3.9s1-2.8 1.4-3.2c.3-.4.8-.5 1-.5h.8c.3 0 .6 0 .9.7l1.2 2.9c.1.2.2.5 0 .8l-.4.7-.6.7c-.2.2-.4.4-.2.8.3.4 1.1 1.8 2.3 2.9 1.6 1.4 2.9 1.8 3.3 2 .4.2.6.2.9-.1l1.3-1.6c.3-.4.6-.3.9-.2l2.8 1.3c.4.2.7.3.8.5.1.2.1 1-.2 1.9z'
GLOBE='<g fill="none" stroke="#0b0906" stroke-width="2.4"><circle cx="16" cy="16" r="11"/><path d="M5 16h22M16 5c4 4 4 18 0 22M16 5c-4 4-4 18 0 22"/></g>'
def make(url,icon,out):
    q=qrcode.QRCode(border=0,error_correction=qrcode.constants.ERROR_CORRECT_H);q.add_data(url);q.make()
    m=q.get_matrix();n=len(m);c=n/2;r=3.6
    d=''.join(f'M{x} {y}h1v1h-1z' for y,row in enumerate(m) for x,v in enumerate(row) if v and ((x+.5-c)**2+(y+.5-c)**2)>r*r)
    P=2.2;W=n+2*P
    ic=f'<path fill="#0b0906" d="{WA}"/>' if icon=='wa' else GLOBE
    s=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-P} {-P} {W} {W}" shape-rendering="crispEdges">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9a7434"/><stop offset=".25" stop-color="#e2c172"/><stop offset=".45" stop-color="#fbe9b4"/><stop offset=".62" stop-color="#cfa755"/><stop offset=".82" stop-color="#8f6b2e"/><stop offset="1" stop-color="#e6c67c"/></linearGradient></defs>
<rect x="{-P+.25}" y="{-P+.25}" width="{W-.5}" height="{W-.5}" rx="1.6" fill="#0b0906" stroke="url(#g)" stroke-width=".5"/>
<path fill="url(#g)" d="{d}"/>
<g shape-rendering="geometricPrecision"><circle cx="{c}" cy="{c}" r="{r-.6}" fill="url(#g)"/><g transform="translate({c-2.4} {c-2.4}) scale(.15)">{ic}</g></g></svg>'''
    open(out,'w').write(s)
make('https://wa.me/966550313745','wa','qr-gold.svg')
make('https://maxdesign.sa','web','qr-web.svg')
