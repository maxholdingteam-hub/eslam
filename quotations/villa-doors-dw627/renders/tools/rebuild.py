import sys
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject
from PIL import Image
src,imgdir,dst=sys.argv[1:4]
w=PdfWriter(clone_from=src)
for i,page in enumerate(w.pages):
    xo=page['/Resources']['/XObject']
    for k in xo:
        obj=xo[k].get_object()
        if obj.get('/Subtype')!='/Image': continue
        im=Image.open(f'{imgdir}/p-{i:03d}.jpg')
        assert im.size==(obj['/Width'],obj['/Height']),(i,im.size)
        data=open(f'{imgdir}/p-{i:03d}.jpg','rb').read()
        obj.set_data(data) if False else None
        obj._data=data
        obj[NameObject('/Filter')]=NameObject('/DCTDecode')
        if '/DecodeParms' in obj: del obj['/DecodeParms']
w.write(dst)
