import urllib.request
import urllib.parse
import ssl
import os
from PIL import Image

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

photos = [
    '/images/2022-09-01--94.jpg',
    '/images/school_theater/22-1254457731_page-0001.jpg',
    '/images/school_theater/gramota/teatrgramota.jpg',
    '/images/novosti/2026-04/XozJKyg8zM95sgIt4f36soAYF_S9HDNPc6VTO5Q8hpbimtxD0JwcJ8Ctzk4ajZSp_BQpzwUWu3Oe-dCPKPz7HfNs.jpg',
    '/images/novosti/2026-04/DL2nmYK5CeQAKEZgth-mGyKUtHZvMNYfpdw_lxg0qyWIOPLhHhgkvt_xyY3nHR632Ab-BRXqXnEgpCdIFVlFdw4a.jpg',
    '/images/novosti/2026-04/13.jpg',
    '/images/novosti/2026-04/15.jpg',
    '/images/novosti/DSC_0352-fill-650x433.jpg',
    '/images/novosti/-rpW8IKebpc-fill-650x487.jpg'
]

out_dir = 'scratch/theater_photos'
os.makedirs(out_dir, exist_ok=True)

base = 'https://pravgimn-kovrov.ru'

for p in photos:
    fname = os.path.basename(p)
    if len(fname) > 30:
        fname = fname[:25] + '.jpg'
    out_file = os.path.join(out_dir, fname)
    url = base + urllib.parse.quote(p)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
            data = r.read()
            with open(out_file, 'wb') as f:
                f.write(data)
            im = Image.open(out_file)
            print(f"OK: {fname} | size={im.size} | bytes={len(data)}")
    except Exception as e:
        print(f"FAIL: {p} -> {e}")
